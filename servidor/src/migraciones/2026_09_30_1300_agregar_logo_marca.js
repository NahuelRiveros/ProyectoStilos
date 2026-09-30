// Logo opcional de cada marca (se ve en la ficha del producto y en el filtro "Marca" de la tienda).
// logo_public_id: id en Cloudinary para poder borrarlo al cambiarlo (null si se pegó una dirección https).

export async function up({ queryInterface, DataTypes, schema }) {
  const marca = { tableName: "marca", schema };
  await queryInterface.addColumn(marca, "logo_url", { type: DataTypes.STRING(500), allowNull: true });
  await queryInterface.addColumn(marca, "logo_public_id", { type: DataTypes.STRING(200), allowNull: true });
}

export async function down({ queryInterface, schema }) {
  const marca = { tableName: "marca", schema };
  await queryInterface.removeColumn(marca, "logo_public_id");
  await queryInterface.removeColumn(marca, "logo_url");
}
