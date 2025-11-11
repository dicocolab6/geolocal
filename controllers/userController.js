const User = require('../models/User');

class UserController {

    //GET /api/users - Listar todos os usuários
    static async getAll(req, res) {
        try {
            const users = await User.findAll();

            res.status(200).json({
                success: true,
                count: users.length,
                data: users 
            });            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message 
            });
        }
    }

    //GET /api/users/:id - Buscar usuário por ID
    static async getOne(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findById(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado!'
                });
            }
            
            res.status(200).json({
                success: true,
                data: user
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    //GET /api/users/:email - Buscar usuário por email
    static async getEmail(req, res) {
        try {
            const { email } = req.params;
            const emailUsr = await User.findByEmail(email);

            if (!emailUsr) {
                return res.status(404).json({
                    success: false,
                    message: 'Email.não encontrado!'
                });
            }

            res.status(200).json({
                success: true,
                data: emailUsr
            })
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message 
            });
        }
    }

    //POST /api/users - Criar novo usuário
    static async createOne(req, res) {
        try {
            const { name, email, password } = req.body;

            //Validação básica
            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos os campos são obrigatórios!'
                });
            }

            // verifica se email já existe
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                res.status(409).json({
                    success: false,
                    message: 'Email já cadastrado!'
                });
            }

            const newUser = await User.create({name, email, password});

            res.status(201).json({
                success: true,
                message: 'Usuário criado com sucesso!',
                data: newUser
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    //PATCH /api/users/:id - Atualizar usuário
    static async updateOne (req, res) {
        try {
            const { id } = req.params;
            const { name, email } = req.body;

            if (!name && !email) {
                res.status(400).json({
                    success: false,
                    message: 'Informe pelo menos um campo a ser atualizado!'
                });
            }

            const updateUser = await User.update(id, { name, email });

            if (!updateUser) {
                res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado!',
                    data: updateUser
                });
            }

            res.status(200).json({
                success: true,
                message: 'Dados atualizados com sucesso!'
            })
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    //DELETE /api/users/:id - Deletar usuário
    static async deleteOne(req, res) {
        try {
            const { id } = req.params;
            const deleteUser = await User.delete(id);

            if (!deleteUser) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado!'
                });
            }

            res.status(200).json({
                succes: true,
                message: 'Usuário deletado com sucesso!'
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

//exportação da classe UserController
module.exports = UserController;