import { useState } from 'react'
import { CreditCard, PaymentForm } from 'react-square-web-payments-sdk';

// FORUM CHAT
function App() {
  const [loading, setLoading] = useState(false)

  const amount = "1.00"

  const handleResponse = async (token) => {
    console.log('success', token)
    setLoading(true)

    const response = await fetch(`${import.meta.env.VITE_TIER_GPAY_BASE_URL}/test/process-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: token.token, amount }),
    });

    const result = await response.json();

    console.log('result', result)
  }

  // const handleError = (error) => {
  //   console.log('error', error)
  // }

  const applicationId = import.meta.env.VITE_SQUARE_APPLICATION_ID
  const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID

  return (
    <>
        <PaymentForm
          /**
           * Identifies the calling form with a verified application ID generated from
           * the Square Application Dashboard.
           */
          applicationId={applicationId}
          /**
           * Invoked when payment form receives the result of a tokenize generation
           * request. The result will be a valid credit card or wallet token, or an error.
           */
          cardTokenizeResponseReceived={handleResponse}
          /**
           * This function enable the Strong Customer Authentication (SCA) flow
           *
           * We strongly recommend use this function to verify the buyer and reduce
           * the chance of fraudulent transactions.
           */
          createVerificationDetails={() => ({
            amount: amount,
            /* collected from the buyer */
            billingContact: {
              addressLines: ['123 Main Street', 'Apartment 1'],
              familyName: 'Doe',
              givenName: 'John',
              countryCode: 'AU',
              city: 'Melbourne',
            },
            countryCode: "AU",
            currencyCode: 'AUD',
            intent: 'CHARGE',
          })}
          /**
           * Identifies the location of the merchant that is taking the payment.
           * Obtained from the Square Application Dashboard - Locations tab.
           */
          locationId={locationId}
        >
          <CreditCard 
            buttonProps={{ isLoading: loading }}
          />
        </PaymentForm>
    </>
  )
}

export default App
