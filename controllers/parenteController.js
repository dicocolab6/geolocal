const Parente = require('../models/Parente');

const ParenteController = {
  // Criar novo parente
  async create(req, res) {
    try {
      const { nome, email, senha } = req.body;
      const id_usr = req.user.id; // ajuste conforme seu middleware Auth
      console.log('[DEBUG] req.user:', req.user);
      console.log('[DEBUG] nome:', nome, 'email:', email, 'senha:', senha, 'id_usr:', id_usr);

      if (!nome || !email || !senha || !id_usr) {
        return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
      }
      const parente = await Parente.create({ nome, email, senha, id_usr });
      res.status(201).json({ data: parente });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  // Listar parentes do usuário logado
  async findAll(req, res) {
    try {
      const id_usr = req.user?.id || req.user?.id_usr;
      const parentes = await Parente.findByUserId(id_usr);
      res.json({ data: parentes });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  // Atualizar parente
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, email } = req.body;
      const updated = await Parente.update(id, { nome, email });
      if (!updated) return res.status(404).json({ message: 'Parente não encontrado.' });
      res.json({ data: updated });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  // Deletar parente
  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Parente.delete(id);
      if (!deleted) return res.status(404).json({ message: 'Parente não encontrado.' });
      res.json({ message: 'Parente deletado com sucesso.' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = ParenteController;
