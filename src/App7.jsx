import GooglePayButton from '@google-pay/button-react';
import { useEffect, useState } from 'react'

// FORUM CHAT
function App() {
  // const [currentUser, setCurrentUser] = useState({})

  // const forumUniqueId = 'forum_txfGlyoRIm'
  // const commentUniqueId = 'cmt_bE05EtcYzW'
  const urlParams = new URLSearchParams(window.location.search);
  const userNo = urlParams.get('userNo'); // 'FIRST'|'SECOND'

  const amount = "100.00"

  useEffect(() => {
    console.log('userNo', userNo)
    console.log('henlo');
  }, [])

  // const getAllComments = async () => {
  //   const response = await fetch(import.meta.env.VITE_PUSHER_BASE_URL5 + `/app/forums/${forumUniqueId}`, {
  //       method: 'GET',
  //       headers: {
  //         "Content-Type": "application/json",
  //         "Authorization": `Bearer ${userNo === 'FIRST' ? appUserAuthToken1 : appUserAuthToken2 }`
  //       },
  //     }
  //   )
  //   const data = await response.json()
  //   console.log('all forum messages', data.comments)
  //   setAllComments(data.comments)
  // }

  // const sendReply = async () => {
  //   const response = await fetch(import.meta.env.VITE_PUSHER_BASE_URL5 + `/app/forums/store-comment-reply`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       "Authorization": `Bearer ${userNo === 'FIRST' ? appUserAuthToken1 : appUserAuthToken2 }`
  //     },

  //     body:JSON.stringify({ forumId: forumUniqueId, commentId: commentUniqueId, comments: messageToBeSent })
  //   })
  //   setMessageToBeSent('')
  //   console.log('sent');
  // }

  const handlePayment = async (paymentData) => {
    try {
      console.log(
        'paymentData', paymentData,
        'token', JSON.parse(paymentData.paymentMethodData.tokenizationData.token)
      );

      const decodedToken = JSON.parse(paymentData.paymentMethodData.tokenizationData.token)
      // Send the payment data to your server
      const response = await fetch(`${import.meta.env.VITE_TIER_GPAY_BASE_URL}/test/process-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature: decodedToken.signature,
          intermediateSigningKey: decodedToken.intermediateSigningKey,
          protocolVersion: decodedToken.protocolVersion,
          signedMessage: decodedToken.signedMessage,
          amount,
        }),
      });
      
      const result = await response.json();

      if (result.success) {
        handleSuccess(result)
      } else {
        handleError(result.error);
      }
    } catch (error) {
      handleError(error.message);
    }
    
  }

  const handleSuccess = (data) => {
    console.log('success', data)
  }

  const handleError = (error) => {
    console.log('error', error)
  }

  return (
    <>
      <GooglePayButton
        environment="TEST"
        buttonColor="white"
        buttonSizeMode="fill"
        buttonType="buy"
        paymentRequest={{
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: [
            {
              type: 'CARD',
              parameters: {
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                allowedCardNetworks: ['MASTERCARD', 'VISA'],
              },
              tokenizationSpecification: {
                type: 'PAYMENT_GATEWAY',
                parameters: {
                  gateway: 'pinpayments',
                  gatewayMerchantId: 'BCR2DN4T76CMV3DD',
                },
              },
            },
          ],
          merchantInfo: {
            merchantId: '12345678901234567890',
            merchantName: 'Demo Merchant',
          },
          transactionInfo: {
            totalPriceStatus: 'FINAL',
            totalPriceLabel: 'Total',
            totalPrice: amount,
            currencyCode: 'USD',
            countryCode: 'US',
          },
        }}
        onLoadPaymentData={handlePayment}
        onError={handleError}
      />
    </>
  )
}

export default App
