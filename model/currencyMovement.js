const { Schema, SchemaTypes, model } = require('mongoose');
const { categories } = require('../helpers/categories');
const mongoosePaginate = require('mongoose-paginate-v2');

const currencyMovement = new Schema(
  {
    date: {
      type: Date,
      required: [true, 'Set date'],
    },
    name: {
      type: String,
      required: [true, 'Set name'],
    },
    category: {
      type: String,
      required: [true, 'Set category'],
      enum: [...categories],
    },
    sum: {
      type: Number,
      required: true,
    },
    owner: {
      type: SchemaTypes.ObjectId,
      ref: 'user',
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
currencyMovement.plugin(mongoosePaginate);
const CurrencyMovement = model('currencyMovement', currencyMovement);

module.exports = CurrencyMovement;
