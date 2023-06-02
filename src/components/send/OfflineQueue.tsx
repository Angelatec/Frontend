import { openDB } from "idb";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { checkServerConnection } from "@/utils";

export const OfflineQueue = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const getMessages = async () => {
    // open a database and create an object store
    const db = await openDB("messagesDB", 1, {
      upgrade(db) {
        db.createObjectStore("messages");
      },
    });

    // get all messages from the store
    const messages = await db.getAll("messages");

    // set the messages state
    setMessages(messages);
  };

  // Useffect para obtener los mensajes de indexedDB
  // Inside your OfflineQueue component
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "New message added") {
        getMessages();
      }
    };

    // create a broadcast channel
    const broadcastChannel = new BroadcastChannel("messagesDB");

    // add event listener for new messages
    broadcastChannel.onmessage = handleMessage;

    getMessages(); // get messages initially

    // cleanup function to close the channel when the component unmounts
    return () => {
      broadcastChannel.close();
    };
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await checkServerConnection(
        "http://localhost:3000/api/hello"
      );
      setIsOnline(connected);
    };

    checkConnection();
  }, []);

  useEffect(() => {
    if (isOnline) {
      setIsSyncing(true);

      getMessages().then(async (msgs) => {
        console.log("Messages to be sent: ", msgs);

        // Here, you can add the code to send the messages to the server

        const db = await openDB("messagesDB", 1);
        await db.clear("messages");

        setIsSyncing(false);
      });
    }
  }, [isOnline]);

  return (
    <div className="mt-5">
      <h2 className="text-2xl font-bold">Cola de mensajes</h2>
      <div className="flex items-center mt-2 group">
        <div
          className={`h-3 w-3 rounded-full ${
            isOnline ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <div className="ml-2">{isOnline ? "En línea" : "Fuera de línea"}</div>
        <div className="relative">
          <div className="ml-2 text-sm cursor-pointer">
            <QuestionMarkCircleIcon className="h-4 w-4 text-gray-500 group-hover:text-gray-900 transition-all" />
          </div>
          <div className="absolute left-0 w-48 p-2 mt-2 text-sm text-white bg-black rounded opacity-0 group-hover:opacity-100">
            {isOnline
              ? "Al estar en línea, los mensajes se publicarán al sitio instantáneamente"
              : "Se publicarán los mensajes en cuanto se obtenga conexión a internet."}
          </div>
        </div>
      </div>
      {isSyncing && <p>Sync in progress...</p>}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className="border-gray-200 border-2 rounded-md p-4 bg-white shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out"
          >
            <p className="text-lg font-semibold">{message.mensaje}</p>
            <p className="text-gray-500 text-sm mt-2">
              {message.nombre} | {message.claveFamiliar}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
