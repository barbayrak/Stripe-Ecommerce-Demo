var stripe;

$.post( "/checkout/create-payment-intent", function( data ) {
    changeLoadingState(false);
    let details = mountCard(data.publishableKey);
    let form = document.getElementById("payment-form");
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        updatePaymentDetails(details.card, data.clientSecret,data.intentId);
    });
});

function mountCard(publishable_key){
    // Create a Stripe client.
    stripe = Stripe(publishable_key);
    let elements = stripe.elements();
    let style = {
        base: {
            color: "#32325d",
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: "antialiased",
            fontSize: "16px",
            "::placeholder": {
                color: "#aab7c4"
            }
        },
        invalid: {
            color: "#fa755a",
            iconColor: "#fa755a"
        }
    };

    let card = elements.create("card", { style: style });
    card.mount("#card-element");

    card.addEventListener('change', ({error}) => {
        const displayError = document.getElementById('card-errors');
        if (error) {
            displayError.textContent = error.message;
        } else {
            displayError.textContent = '';
        }
    });

    return {
        card: card
    };
}

function updatePaymentDetails(card, clientSecret,intentId) {
    changeLoadingState(true);

    $.post( "/checkout/update-payment-intent",
        {
            intentId: intentId,
            name: $("#name").val(),
            email: $("#email").val(),
            address: {
                address : $("#address").val(),
                city: $("#city").val(),
                zip: $("#zip").val()
            }
        }, function( data ) {
        submitPayment(card, clientSecret,intentId);
    });

};

function submitPayment(card, clientSecret,intentId) {
    changeLoadingState(true);
    // Initiate the payment.
    // If authentication is required, confirmCardPayment will automatically display a modal
    stripe.confirmCardPayment(clientSecret, {
        payment_method: {
            card: card
        }
    }).then(function(result) {
        if (result.error) {
            showError(result.error.message);
        } else {
            orderComplete(clientSecret,intentId);
        }
    });
};

/* Shows a success / error message when the payment is complete */
function orderComplete(clientSecret,intentId) {
    $.post( "/checkout/payment-charge",
        {
            intentId: intentId,
        }, function( data ) {
            var amount = data.amount;
            var currency = data.currency;
            var chargeId = data.chargeId;
            var message =
                "You payment is complete with : \n" +
                "Amount : " + amount + " " + currency + "\n" +
                "Payment Intent Id : " + intentId + "\n" +
                "Charge Id : " + chargeId
            swal("Success!",message , "success").then((value) => {
                location.href = '/checkout/complete-checkout'
            });
        });
};

function showError(errorMsgText) {
    changeLoadingState(false);
    let errorMsg = document.getElementById("card-errors");
    errorMsg.innerHTML = errorMsgText;
    setTimeout(function() {
        errorMsg.innerHTML = "";
    }, 4000);
};

// Show a spinner on payment submission
function changeLoadingState(isLoading) {
    if (isLoading) {
        document.getElementById("submit").disabled = true;
        document.getElementById("loader").classList.remove("hidden");
        document.getElementById("button-text").classList.add("hidden");
    } else {
        document.getElementById("submit").disabled = false;
        document.getElementById("loader").classList.add("hidden");
        document.getElementById("button-text").classList.remove("hidden");
    }
};