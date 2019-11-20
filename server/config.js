/*
*   Written by Kaan Baris Bayrak
*   config.js
*
*   Project configuration , normally this config values should
*   come from envionment variables but since this is a demo project
*   lets use it directly from here
 */

module.exports = {
    isProduction: (process.env.NODE_ENV === 'production'),
    currency: 'eur',
    stripe: {
        country: 'NL',
        apiVersion: '2019-11-05',
        publishableKey: 'pk_test_BNBp8Fn2R21x60bUtT06a0vi00YOeLCVDk',
        secretKey: 'sk_test_2HZUazBrjwHpoOQMMejMHA7e00qUPHIJk1',
        webhookSecret: 'whsec_8RjzTIdsuK43DMdOQ3OTscUJr4DU5wVh'
    },
    port: process.env.PORT || 8000
};