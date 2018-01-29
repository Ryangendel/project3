module.exports = function(sequelize, DataTypes) {
  var City = sequelize.define("City", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      validate: {
        len: [1]
      },
      primaryKey:true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1]
      }
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1]
      }
    }
  });

  City.associate = function(models) {
    // Associating City with Flags
    // When an City is deleted, also delete any associated Flags
    City.hasMany(models.Flag,{onDelete: "cascade"});
    City.hasMany(models.Vote,{onDelete: "cascade"});
  };
  return City;
};
