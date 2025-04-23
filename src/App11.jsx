import { useState } from 'react'
import { ApplePay, PaymentForm } from 'react-square-web-payments-sdk';

// EDU CONTENT PURCHASE
function App() {
  const [loading, setLoading] = useState(false)

  const appUserId = 'usr_c1R4KKrR03'
  const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl9jMVI0S0tyUjAzIiwibmFtZSI6ImJvbmUiLCJ1c2VybmFtZSI6ImZsZXRjaGVyIiwiZW1haWwiOm51bGwsInBob25lIjoiKzg4MDE3NjIyMTQzMTUiLCJ3aGF0c2FwcF9ubyI6bnVsbCwidmVyaWZpZWQiOnRydWUsImd1ZXN0Ijp0cnVlLCJpYXQiOjE3NDI5NTk0MjEsImV4cCI6MTc0NTU1MTQyMX0.FAGoqYDzhj1CQ7aG_6qfwpL5na6svb0bU0T6Q8qSAS8'
  const name = 'Demo name'
  const eduContentId = 'educ_FetQvClVA7'
  const amount = '1.00' // type has to be string and 2 d.p
  const userName = `${name}(UserId: ${appUserId})`
  const countryCode = 'AU'
  const currencyCode = 'AUD'

  const handleTierPurchase = async (token) => {
    console.log('success', token)
    setLoading(true)
    const response = await fetch(`${import.meta.env.VITE_CONTENT_SERVICE_BASE_URL}/test/applePay`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ payment_token: token.token, amount: Number(amount) }),
    });

    const result = await response.json();

    if(result.error)
      setLoading(false)

    console.log('result', result)
  }

  const applicationId = import.meta.env.VITE_SQUARE_APPLICATION_ID
  const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID

  return (
    <>
        <h1>Edu Content Purchase</h1>

        <PaymentForm
          applicationId={applicationId}
          cardTokenizeResponseReceived={handleTierPurchase}
          createVerificationDetails={() => ({
            amount: amount,
            billingContact: {
              givenName: userName,
              countryCode: countryCode,
            },
            countryCode: countryCode,
            currencyCode: currencyCode,
            intent: 'CHARGE',
          })}
          locationId={locationId}
        >
          <ApplePay buttonProps={{ isLoading: loading }} />
        </PaymentForm>
    </>
  )
}

export default App
