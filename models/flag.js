module.exports = function(sequelize, DataTypes) {
  var Flag = sequelize.define("Flag", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1]
      }
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1]
      }
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      len: [1]
    },
    voteCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        len: [1]
      },
      value: 0
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        len: [1]
      }
    }
  });

  Flag.associate = function(models) {
    // We're saying that a Flag should belong to a City
    // A Flag can't be created without a City due to the foreign key constraint
    Flag.belongsTo(models.City,{foreignKey:{allowNull: false}});
    //Flag.hasMany(models.Vote,{onDelete: "cascade"});
  };
  return Flag;
};
