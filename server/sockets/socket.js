const { io } = require("../server");
const { Usuarios } = require("../classes/usuarios");
const { crearMensaje } = require("../utilidades/utilidades");

const usuarios = new Usuarios();

io.on("connection", (client) => {
  client.on("entrarChat", (data, callback) => {
    if (!data.nombre || !data.sala) {
      return callback({
        error: true,
        mensaje: "el nombre/sala es necesario",
      });
    }

    client.join(data.sala);

    let personas = usuarios.agregarPersona(client.id, data.nombre, data.sala);

    client.broadcast
      .to(data.sala)
      .emit("listaPersonas", usuarios.getPersonasPorSala(data.sala));

    callback(usuarios.getPersonasPorSala(data.sala));
  });

  client.on("crearMensaje", (data) => {
    let persona = usuarios.getPersonas(client.id);
    let mensaje = crearMensaje(persona.nombre, data.mensaje);
    client.broadcast.to(persona.sala).emit("crearMensaje", mensaje);
  });

  client.on("disconnect", () => {
    let persona = usuarios.borrarPersona(client.id);

    client.broadcast
      .to(persona.sala)
      .emit(
        "crearMensaje",
        crearMensaje("Administrador", `${persona.nombre} salió`)
      );
    client.broadcast
      .to(persona.sala)
      .emit("listaPersonas", usuarios.getPersonasPorSala(persona.sala));
  });

  client.on("mensajePrivado", (data) => {
    let persona = usuarios.getPersonas(client.id);
    client.broadcast
      .to(data.para)
      .emit("mensajePrivado", crearMensaje(persona.nombre, data.mensaje));
  });
});
