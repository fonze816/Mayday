import {
  Container,
  Header,
  Content,
  List,
  ListItem,
  Left,
  Body,
  Right,
  Thumbnail,
  Text,
  View,
  Button,
} from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import Chat from "../Screens/Chat";
const ChatListStack = createStackNavigator();
import { useRoute } from "@react-navigation/native";
import { useNavigationState } from "@react-navigation/native";
import firebase from "firebase";

import { useEffect, useLayoutEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchChatList,
  fetchConversations,
  fetchMessages,
  fetchUser,
} from "../redux/actions";
import { user } from "../redux/reducers/user";

function usePreviousRouteName() {
  return useNavigationState((state) =>
    state.routes[state.index - 1]?.name
      ? state.routes[state.index - 1].name
      : "None"
  );
}

const ChatList = ({ navigation, previous }) => {
  const dispatch = useDispatch();
  useLayoutEffect(() => {
    const conversUnsubscribe = dispatch(fetchConversations());
    const userUnsubscribe = dispatch(fetchUser());
    return () => {
      conversUnsubscribe()
      userUnsubscribe()
    }
  }, []);

  const conversations = useSelector((state) => state.userState.conversations);

  const currentUser = useSelector((state) => state.userState.currentUser);

  async function createChat(uid) {
    let user = [];
    let chatid;
    await firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          user = snapshot.data();
        } else {
          console.log("does not exist");
        }
      });
    await firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("conversations")

      .add({
        talkingto: user.FirstName + " " + user.LastName,
        userid: uid,
        timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
        userOne: {
          firsName: currentUser.FirstName,
          lastName: currentUser.LastName,
          email: currentUser.Email,
        },
        userTwo: {
          firsName: user.FirstName,
          lastName: user.LastName,
          email: user.Email,
        },
        latestMessage: {
          _id: "",
          createdAt: "",
          text: "",
          timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
          chatid: "",
          user: "",
          chatRecepient: "",
          uid: "",
        },
      })
      .then((snapshot) => {
        chatid = snapshot.id;
      });
    await firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .collection("conversations")
      .doc(chatid)
      .set({
        talkingto: currentUser.FirstName + " " + currentUser.LastName,
        userid: firebase.auth().currentUser.uid,
        timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
        userOne: {
          firsName: currentUser.FirstName,
          lastName: currentUser.LastName,
          email: currentUser.Email,
        },
        userTwo: {
          firsName: user.FirstName,
          lastName: user.LastName,
          email: user.Email,
        },
        latestMessage: {
          _id: "",
          createdAt: "",
          text: "",
          timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
          chatid: "",
          user: "",
          chatRecepient: "",
          uid: "",
        },
      });
    await firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update(
        "chats",
        firebase.firestore.FieldValue.arrayUnion({
          chatid: chatid,
          Recepient: uid,
        })
      );
    await firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .update(
        "chats",
        firebase.firestore.FieldValue.arrayUnion({
          chatid: chatid,
          Recepient: firebase.auth().currentUser.uid,
        })
      );
  }
  const usersList = () => {
    return conversations.map((chat) => {
      console.log(chat.data.timeStamp.toDate().getHours().toString());
      let time = {
        Hours: chat.data.timeStamp.toDate().getHours().toString(),
        Minutes: chat.data.timeStamp.toDate().getMinutes().toString(),
        Day: chat.data.timeStamp.toDate().getDate().toString(),
        Year: chat.data.timeStamp.toDate().getFullYear().toString(),
        Month: chat.data.timeStamp.toDate().getMonth().toString(),
      };
      if (Number(time.Minutes) < 10) {
        time = { ...time, Minutes: "0" + time.Minutes };
      }
      return (
        <ListItem
          onPress={async () => {

            navigation.navigate("Chat", {
              userid: chat.data.userid,
              chatid: chat.id,
            });
          }}
          key={chat.id}
          thumbnail
        >
          <Left>
            <Thumbnail
              source={{
                uri: "https://p.kindpng.com/picc/s/78-786207_user-avatar-png-user-avatar-icon-png-transparent.png",
              }}
            />
          </Left>

          <Body style={{ flexDirection: "column" }}>
            <Text style={{ fontWeight: "bold" }}>{chat.data.talkingto}</Text>

            <Text style={{ marginTop: 5 }} note numberOfLines={1}>
              {chat.data.latestMessage.text}
            </Text>
          </Body>
          <Right
            style={{ flexDirection: "column", justifyContent: "flex-end" }}
          >
            <Text note>
              {time.Day +
                "/" +
                time.Month +
                "/" +
                time.Year +
                "  " +
                time.Hours +
                ":" +
                time.Minutes}
            </Text>

            <TouchableOpacity style={{ marginTop: 10 }}>
              <AntDesign name="delete" size={24} color="black" />
            </TouchableOpacity>
          </Right>
        </ListItem>
      );
    });
  };

  if (!conversations) return <View></View>;
  else {
    return (
      <Container>
        <Content>
          <List>{usersList()}</List>
        </Content>
      </Container>
    );
  }
};
const ChatListStackScreen = ({ navigation, previous }) => (
  <ChatListStack.Navigator>
    <ChatListStack.Screen
      name="ChatList"
      component={ChatList}
      options={{
        title: "Chats",
        headerShown: usePreviousRouteName() == "Home" ? true : false,
      }}
    />
    <ChatListStack.Screen
      name="Chat"
      component={Chat}
      options={{ title: "Chat" }}
    />
  </ChatListStack.Navigator>
);

export default ChatListStackScreen;
const styles = StyleSheet.create({
  button: {
    marginTop: 50,
    marginBottom: 10,
    alignContent: "center",
    backgroundColor: "rgb(250,91,90)",
  },
});
