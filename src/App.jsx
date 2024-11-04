import { useEffect, useState } from 'react'
import {Client as ConversationsClient} from '@twilio/conversations';

function App() {
  const [clientState, setClientState] = useState(null)
  const [conversationState, setConversationState] = useState(null)
  const [connectionState, setConnectionState] = useState(null)
  const [conversationSid, setConversationSid] = useState(null)
  const [messages, setMessages] = useState([])

  useEffect(() => {
    setConversationSid('CHe305beff8971440eaec2a8d466ea8636')
    initConversations()
    return async () => {
      await connectionState?.shutdown()
      await clientState?.shutdown();
    }
  }, [])

  const initConversations = async () => {
    const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl81NjkxMzQ2NTg5MTM1MCIsIm5hbWUiOm51bGwsInVzZXJuYW1lIjoiVXNlciAyIiwiZW1haWwiOiJ1c2VyMkBtYWlsLmNvbSIsInBob25lIjoiMjM0NTY3ODkiLCJ3aGF0c2FwcF9ubyI6bnVsbCwidmVyaWZpZWQiOnRydWUsImd1ZXN0IjpmYWxzZSwiaWF0IjoxNzMwNzI1NzMzLCJleHAiOjE3MzMzMTc3MzN9.zTriYTm_qdwYqqHqdgDU2Xs6vJzXDPMk6zxd4wu8FFg';
    const url = 'http://localhost:4003/content/api/v1/app/professionals/get_chat_token/CHe305beff8971440eaec2a8d466ea8636';
    let token = '';
    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const json = await response.json();
      console.log('json data', json.data);
      token = json.data.chat_token
    } catch (error) {
      console.error(error.message);
    }

    let client = new ConversationsClient(token);

    client.on("stateChanged", (state) => {
      if (state === 'connecting') {
        setConnectionState('connecting');
      }
      if (state === 'connected') {
        setConnectionState('connected');
      }
      if (state === 'disconnecting') {
        setConnectionState('disconnecting');
      }
    });
    client.on('connectionError', (data) => {
      setConnectionState('connectionError');
    });
    client.on('conversationJoined', (conversation) => {
      setConnectionState('conversationJoined');
      // this.setState({
      //   conversations: [...this.state.conversations, conversation],
      // });
    });
    client.on('conversationLeft', (thisConversation) => {
      setConnectionState('conversationLeft');
      // this.setState({
      //   conversations: [
      //     ...this.state.conversations.filter(it => it !== thisConversation),
      //   ],
      // });
    });
    client.on("tokenAboutToExpire", async (time) => {
      // token is about to expire. get a new token
      try {
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl81NjkxMzQ2NTg5MTM0MCIsIm5hbWUiOm51bGwsInVzZXJuYW1lIjoiZmxldGNoZXIiLCJlbWFpbCI6Im1haGluLmNob3dkaHVyeS4xOTkxQGdtYWlsLmNvbSIsInBob25lIjoiKzg4MDE3NjIyMTQzMTUiLCJ3aGF0c2FwcF9ubyI6bnVsbCwidmVyaWZpZWQiOnRydWUsImd1ZXN0Ijp0cnVlLCJpYXQiOjE3MzA2OTE5OTMsImV4cCI6MTczMzI4Mzk5M30.t4TPz9hmaGRIOsMiUGvcPBhxwc2RhWNh5v84ERC1Hzw",
          },
        });
        const json = await response.json();
        console.log('about to expire', json.data);
        token = json.data.chat_token
      } catch {
          return Error("Unable to get a token");
      }
      // update the client with new token
      client = await client.updateToken(token);
      setClientState(client)
      // use updated client
    });

    client.on("tokenExpired", async (time) => {
      // token is about to expire. get a new token
      try {
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl81NjkxMzQ2NTg5MTM0MCIsIm5hbWUiOm51bGwsInVzZXJuYW1lIjoiZmxldGNoZXIiLCJlbWFpbCI6Im1haGluLmNob3dkaHVyeS4xOTkxQGdtYWlsLmNvbSIsInBob25lIjoiKzg4MDE3NjIyMTQzMTUiLCJ3aGF0c2FwcF9ubyI6bnVsbCwidmVyaWZpZWQiOnRydWUsImd1ZXN0Ijp0cnVlLCJpYXQiOjE3MzA2OTE5OTMsImV4cCI6MTczMzI4Mzk5M30.t4TPz9hmaGRIOsMiUGvcPBhxwc2RhWNh5v84ERC1Hzw",
          },
        });
        const json = await response.json();
        console.log('about to expire', json.data);
        token = json.data.chat_token
      } catch {
          return Error("Unable to get a token");
      }
      // update the client with new token
      client = await client.updateToken(token)
      setClientState(client)
    });

    setClientState(client)

    const conversation = await clientState.conversations(conversationSid)
    setConversationState(conversation)
    console.log(conversation);
    
    // use updated client

    const allMessages = await conversation(conversationSid).getMessages(30, 0, "backwards");
    console.log('allMessages', allMessages);
    setMessages(allMessages)
  };

  return (
    <>
      Connection State: {connectionState}
      Conversation State: {conversationState}
      allMessages: {messages}
    </>
  )
}

export default App
