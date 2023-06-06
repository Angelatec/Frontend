import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { openDB } from "idb";
import { v4 as uuidv4 } from "uuid";

export const SendForm = () => {
  const [useKey, setUseKey] = useState(false);
  const [formData, setFormData] = useState<{
    name?: string;
    secret?: string;
    message?: string;
  }>({});
  const [loading, setLoading] = useState(false); // New loading state
  const [isOnline, setIsOnline] = useState(true);

  const onKeyToggle = (e: any) => {
    setUseKey((cur) => !cur);
  };

  const handleInputChange = (e: any) => {
    setFormData((cur) => ({
      ...cur,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener("online", handleOnlineStatusChange);
    window.addEventListener("offline", handleOnlineStatusChange);

    // initial online status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnlineStatusChange);
      window.removeEventListener("offline", handleOnlineStatusChange);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when form is submitted

    if (!isOnline) {
      // open a database and create an object store
      const db = await openDB("messagesDB", 1, {
        upgrade(db) {
          db.createObjectStore("messages", { autoIncrement: true });
        },
      });

      console.log("adding message to the store", formData);

      // add the message to the store
      const id = uuidv4();
      await db.add("messages", { ...formData, id }, id);

      // create a broadcast channel
      const broadcastChannel = new BroadcastChannel("messagesDB");

      // send a message to the channel
      broadcastChannel.postMessage("New message added");

      toast.success("Mensaje agregado a la cola/T'aan agregado u nej");
      setLoading(false); // Set loading to false when form is submitted
      setFormData({});
      return;
    } else {
      fetch("api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((res) => res.json())
        .then((data) => {
          toast.success("Mensaje publicado/T'aan a'ala'an");
        })
        .catch((err) => {
          toast.error("Error al publicar el mensaje/Ba'alo' ti' le publicar le k'uuben t'aano'");
        });
    }

    setLoading(false); // Set loading to false when form is submitted
    setFormData({});
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-2">
        <div className="overflow-hidden shadow sm:rounded-md">
          <div className="bg-white px-4 py-5 sm:p-6">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6">
                <label className="block text-xl font-medium leading-6 text-gray-900">
                  Nombre/k&apos;aaba&apos;
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Escribe tu nombre/Ts'íibt a k'aaba'"
                  className="transition-all mt-2 block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-lg sm:leading-6 disabled:bg-slate-200 disabled:cursor-not-allowed"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="col-span-6">
                <span className="flex">
                  <label className="block text-xl font-medium leading-6 text-gray-900">
                    Clave familiar
                  </label>
                  <label className="ml-2 relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      value=""
                      className="sr-only peer"
                      onChange={onKeyToggle}
                      checked={useKey}
                      disabled={loading}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>{" "}
                  </label>
                </span>
                <input
                  type="text"
                  disabled={!useKey || loading}
                  name="secret"
                  id="secret"
                  placeholder="Escribe tu clave/Ts'íibt a clave"
                  value={formData.secret || ""}
                  onChange={handleInputChange}
                  className="transition-all mt-2 block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-lg sm:leading-6 disabled:bg-slate-200 disabled:cursor-not-allowed"
                />
              </div>

              <div className="col-span-6">
                <label className="block text-xl font-medium leading-6 text-gray-900">
                  Mensaje/Ts&apos;íibo&apos;ob
                </label>
                <textarea
                  name="message"
                  id="message"
                  placeholder="Escribe tu mensaje/Ts'íib a k'uuben t'aano'"
                  value={formData.message || ""}
                  onChange={handleInputChange}
                  className="resize-none rounded-md border-0 mt-2 w-full p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-lg sm:leading-6 disabled:bg-slate-200 disabled:cursor-not-allowed transition-all"
                  rows={7}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
          {isOnline ? (
            <></>
          ) : (
            <div className="bg-gray-50 px-4 py-3 text-center sm:px-6">
              <p className="text-sm text-gray-500">
                Estás fuera de línea, el mensaje se enviará cuando tengas
                conexión a internet./T&apos;áan a paach internet ichil, le kuuben t&apos;aano ku enviará ken a conexión internet
              </p>
            </div>
          )}
          <div className="bg-gray-50 px-4 py-3 text-center sm:px-6">
            <button
              type="submit"
              className="inline-flex justify-center rounded-md bg-green-600 py-2 px-3 text-lg font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-all"
              disabled={loading || !formData.name || !formData.message}
            >
              Publicar mensaje/ Publicar taan
            </button>
          </div>
        </div>
      </form>
    </>
  );
};
