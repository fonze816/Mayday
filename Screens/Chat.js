import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import firebase from "firebase";
import { View, Text } from "native-base";
import React, { useCallback, useLayoutEffect } from "react";
import { TouchableWithoutFeedback } from "react-native";
import { Bubble, GiftedChat, Send } from "react-native-gifted-chat";
import { useDispatch, useSelector } from "react-redux";
import { getExpoTokenById } from "../Components/functions/functions";
import {
  addNotification,
  sendPushNotification,
} from "../Components/functions/functions";
import { deleteChat } from "../Components/functions/functions";
import { fetchMessages, fetchUser, updateMessages } from "../redux/actions";

function Chat({ route, navigation }) {
  //constants
  const userid = firebase.auth().currentUser.uid;
  const dispatch = useDispatch();
  const chatid = route.params.chatid;
  const fetchedmessages = useSelector((state) => state.userState.messages);

  //fetch on mount and unsubscribe on unmount

  useLayoutEffect(() => {
    const messagesUnsubscribe = dispatch(fetchMessages(userid, chatid));
    const userUnsubscribe = dispatch(fetchUser());

    return () => {
      messagesUnsubscribe();
      userUnsubscribe();
    };
  }, [route]);

  const currentUser = useSelector((state) => state.userState.currentUser);

  const chatRecepient = route.params.userid;

  const onSend = useCallback((Messages = []) => {
    let message = Messages[0];
    dispatch(updateMessages(message, userid, chatRecepient, chatid));

    let chatMessage =
      currentUser.FirstName + " " + currentUser.LastName + " : " + message.text;
    getExpoTokenById(chatRecepient).then((result) => {
      sendPushNotification(result, "🚨RESCU", chatMessage, "chatMsg");
      addNotification(chatRecepient, chatMessage, "🚨RESCU", false, "chatMsg");
    });
  }, []);
  const scrolllToBottomComponent = (props) => {
    return <Feather name="chevrons-down" size={24} color="black" />;
  };
  const renderBubble = (props) => {
    return (
      <TouchableWithoutFeedback {...props}>
        <Bubble
          {...props}
          wrapperStyle={{
            right: {
              backgroundColor: "#4287f5",
            },
            left: {
              backgroundColor: "gray",
            },
          }}
          textStyle={{
            right: {
              color: "white",
            },
            left: { color: "white" },
          }}
        ></Bubble>
      </TouchableWithoutFeedback>
    );
  };
  const renderSend = (props) => {
    return (
      <Send {...props}>
        <View style={{ marginRight: 10, marginBottom: 10 }}>
          <MaterialCommunityIcons
            name="send-circle-outline"
            size={30}
            color="#4287f5"
          />
        </View>
      </Send>
    );
  };
  function renderChatEmpty() {
    return (
      <View
        style={{
          flex: 1,
          alignSelf: "center",
          justifyContent: "center",
          transform: [{ scaleY: -1 }],
        }}
      >
        <Text> Chat is currently empty</Text>
      </View>
    );
  }
  if (!fetchedmessages) return <View></View>;
  else
    return (
      <GiftedChat
        scrollToBottom={true}
        messages={fetchedmessages}
        onSend={(messages) => onSend(messages)}
        onLongPress={(context, message) => {
          console.log(context);
        }}
        user={{
          _id: firebase.auth().currentUser.uid,
          name: currentUser.FirstName + " " + currentUser.LastName,
          avatar: JSON.stringify(currentUser.PhotoURI),
        }}
        alwaysShowSend={true}
        renderChatEmpty={renderChatEmpty}
        showUserAvatar={true}
        renderBubble={renderBubble}
        renderSend={renderSend}
        renderchat
        renderAvatarOnTop
        scrollToBottomComponent={scrolllToBottomComponent}
      />
    );
}

export default Chat;
