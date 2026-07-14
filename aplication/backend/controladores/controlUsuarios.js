const Usuario = require("../modelos/Usuario");

//Registrar usuarios
exports.registrar = async (req, res) => {
    const { nombre, contrasena } = req.body;
    let usuario = await Usuario.findOne({ nombre, contrasena });

    if (!usuario) {
        usuario = new Usuario({ nombre, contrasena });
        await usuario.save();
    }

    res.json(usuario);
};

//Iniciar sesion -- Si contrasena mal, o no existe, error controlado
exports.login = async (req, res) => {
    const { nombre, contrasena } = req.body;
    const usuario = await Usuario.findOne({ nombre, contrasena });

    if (!usuario) { return res.status(401).json({ message: "Usuario incorrecto o no esta creado" }); } //Si no esta creado

    res.json(usuario);
};

//Obtener todos los usuarios -- Para probar cosas y tal
exports.obtenerUsuarios = async (req, res) => {
    const usuarios = await Usuario.find();
    res.json(usuarios);
};

//Eliminar usuarios
exports.eliminar = async (req, res) => {
    const { id } = req.params;
    const usuario = await Usuario.findByIdAndDelete(id);

    if (!usuario) { return res.status(404).json({ message: "Usuario no encontrado" }); }

    res.json({ message: "Usuario eliminado correctamente" });
};