import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient: Client | null = null;

export const connectSocket = (token: string, onMessage: (msg: any) => void) => {
  return new Promise<void>((resolve, reject) => {
    const socket = new SockJS("http://localhost:8081/ws");

    stompClient = new Client({
      webSocketFactory: () => socket as any,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => console.log("🟦 STOMP DEBUG:", str),

      onConnect: () => {
        console.log("🟩 STOMP CONNECTED");

        stompClient?.subscribe("/user/queue/notifications", (msg) => {
          const parsed = JSON.parse(msg.body);
          console.log("🔔 WEBSOCKET NOTI:", parsed);
          onMessage(parsed);
        });

        resolve();
      },

      onStompError: (frame) => {
        console.error("🟥 STOMP ERROR:", frame);
        reject(frame);
      },
    });

    stompClient.activate();
  });
};

export const disconnectSocket = () => {
  stompClient?.deactivate();
};
