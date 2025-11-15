const io = require("socket.io-client");
const socket = io("http://localhost:3000");

socket.on("connect", () => {
  socket.emit("authenticate", { token: "devtest" }, (authRes) => {
    console.log("auth", authRes);
    if (!authRes.success) { socket.close(); return; }
    const start = Date.now();
    socket.emit("gift-wizard:get-realms", {}, (res) => {
      const elapsed = Date.now() - start;
      console.log("realms", elapsed, "ms", res);
      socket.close();
    });
  });
});
