'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Transaction.init({
    id_transaksi: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    receiver: {
      type: DataTypes.STRING,
      allowNull: false
    },
    donator: {
      type: DataTypes.STRING
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    cut: {
      type: DataTypes.DOUBLE,
      allowNull: false //untuk donasi, cut 10%, untuk transfer cut biaya admin
    },
    total: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    bank_code: {
      type: DataTypes.STRING
    },
    bank_account: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
    paranoid: true
  });
  return Transaction;
};