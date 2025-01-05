import { useEffect, useState } from 'react'
import Pusher from 'pusher-js';

// FORUM CHAT
function App() {
  const [currentUser, setCurrentUser] = useState({})
  const [messageToBeSent, setMessageToBeSent] = useState('')
  const [allComments, setAllComments] = useState([])
  const [joinedMembersCount, setJoinedMembersCount] = useState(0)
  const [statusMessage, setStatusMessage] = useState(null)

  const appUserId = 'usr_Rih27LQM5K'
  const appUserId2 = 'usr_FY9TFfGmIW'
  const appUserAuthToken1 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl9SaWgyN0xRTTVLIiwibmFtZSI6ImZsZXRjaGVyMSIsInVzZXJuYW1lIjoiZmxldGNoZXIxIiwiZW1haWwiOm51bGwsInBob25lIjoiKzg4MDE3NjIyMTQzMTUiLCJ3aGF0c2FwcF9ubyI6bnVsbCwidmVyaWZpZWQiOnRydWUsImd1ZXN0IjpmYWxzZSwiaWF0IjoxNzM1ODA4MzAxLCJleHAiOjE3Mzg0MDAzMDF9.z13Ljw6pajyUHo_0VLKGyWsAOvV9S9yOUj7sdWG9PhQ"
  const appUserAuthToken2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl9GWTlURmZHbUlXIiwibmFtZSI6IkFsZmkgU2hhcmluIFJpenZpIiwidXNlcm5hbWUiOiJhc3JpenZpIiwiZW1haWwiOm51bGwsInBob25lIjoiKzg4MDE0MDgwMTY4NzQiLCJ3aGF0c2FwcF9ubyI6bnVsbCwidmVyaWZpZWQiOnRydWUsImd1ZXN0Ijp0cnVlLCJpYXQiOjE3MzU4MDgyNzQsImV4cCI6MTczODQwMDI3NH0.q97T9czrcApPleAp0tyff3l63V12zMEuohP5sMp7D6c"
  const blogUniqueId = 'blog_mcXDv11Aw3'
  const commentUniqueId = 'cmt_R44u68XXdz'
  const urlParams = new URLSearchParams(window.location.search);
  const userNo = urlParams.get('userNo'); // 'FIRST'|'SECOND'

  useEffect(() => {
    console.log('userNo', userNo)
    const pusherClient = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
      channelAuthorization: {
        endpoint: import.meta.env.VITE_PUSHER_AUTH_BASE_URL5 + `/${blogUniqueId}/user/${userNo === 'FIRST' ? appUserId : appUserId2}`
      }
    });

    const pusherBindEvents = async () => {
      var channel = pusherClient.subscribe(`presence-blog-${blogUniqueId}`);
  
      channel.bind("pusher:subscription_succeeded", (members) => {
        console.log('subscription_succeeded');
        var thisUser = channel.members.me;
        console.log(thisUser)
        setCurrentUser({ id: thisUser.id, ...thisUser.info })
  
        // console.log('all members details', members.count, members);
        setJoinedMembersCount(members.count)
        // LIST OF JOINED MEMBERS
        members.each((member) => {
          console.log('new member joined', member)
        });
      });
      channel.bind("pusher:member_added", (member) => {
        console.log('member_added');
        setStatusMessage(`${member.info.username} has joined the chat`)
      });
      channel.bind("pusher:member_removed", (member) => {
        console.log('member_removed');
        setStatusMessage(`${member.info.username} has left the chat`)
      });
      channel.bind("pusher:subscription_error", (data) => {
          console.log('subscription_error', data)
      });
      channel.bind("new-comment-submitted", (data) => {
        console.log('new-comment-submitted', data);
        setAllComments(prevComments => [...prevComments, data])
      });
      channel.bind("new-reply-submitted", (data) => {
        console.log('new-reply-submitted', data);

        setAllComments(prevComments => {
          console.log(data.commentUniqueId)
          const comment = prevComments.find((comment) => {
            console.log('looper', comment)
            return data.commentUniqueId === comment.uniqueId
          })
          console.log('found comment', comment)
          if(comment && comment.replies && comment.replies.length)
            comment.replies = [...comment.replies, data]
          else
          comment.replies = [data]
          console.log('uploaded comment', prevComments)
          // return [...prevComments, data]
          return [...prevComments]
        })
      });
    };

    console.log('henlo');
    getAllComments()
    console.log(pusherClient);
    pusherBindEvents()
    return (() => {
      pusherClient.unsubscribe(`presence-blog-${blogUniqueId}`)
    })
  }, [])

  const getAllComments = async () => {
    const response = await fetch(import.meta.env.VITE_PUSHER_BASE_URL5 + `/app/blogs/${blogUniqueId}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userNo === 'FIRST' ? appUserAuthToken1 : appUserAuthToken2 }`
        },
      }
    )
    const data = await response.json()
    console.log('all blog messages', data.comments)
    setAllComments(data.comments)
  }

  const sendComment = async () => {
    const response = await fetch(import.meta.env.VITE_PUSHER_BASE_URL5 + `/app/blogs/store-comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userNo === 'FIRST' ? appUserAuthToken1 : appUserAuthToken2 }`
      },

      body:JSON.stringify({ blogId: blogUniqueId, comments: messageToBeSent })
    })
    setMessageToBeSent('')
    console.log('sent');
  }

  const sendReply = async () => {
    const response = await fetch(import.meta.env.VITE_PUSHER_BASE_URL5 + `/app/blogs/store-comment-reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userNo === 'FIRST' ? appUserAuthToken1 : appUserAuthToken2 }`
      },

      body:JSON.stringify({ blogId: blogUniqueId, commentId: commentUniqueId, comments: messageToBeSent })
    })
    setMessageToBeSent('')
    console.log('sent');
  }

  return (
    <>
      <h5>{statusMessage ? statusMessage : ''}</h5>
      <p>{joinedMembersCount} members active</p>
      <br />
      <p>
        CurrentUser: 
        Id: { currentUser.id } <br />
        Name: { currentUser.name } <br />
        Username: { currentUser.username } <br />
      </p>
      <br />
      <div>
        <br />
        <div style={{ padding: "25px", borderRightStyle: 'solid', borderRightColor: 'white', borderRightWidth: 2 }}>
          <h6> All Messages: </h6>
          {allComments.map((msg, index) => {
            return (
              <div key={index}>
              <p>{msg.comments}</p>
              <div style={{ paddingLeft: "25px", }}>
                {
                  msg.replies && msg.replies.map((reply, index) => {
                    return (<p key={index}>{reply.comments}</p>)
                  })
                }
              </div>
            </div>
            )
          })}
        </div>
      </div>
      <br />
      <input type="text" onChange={(e) => setMessageToBeSent(e.target.value)} value={messageToBeSent} />
      <br />
      <br />
      <button type="button" onClick={sendComment}>Send Comment</button>
      <button style={{ marginLeft: "10px" }} type="button" onClick={sendReply}>Send Reply</button>
    </>
  )
}

export default App
