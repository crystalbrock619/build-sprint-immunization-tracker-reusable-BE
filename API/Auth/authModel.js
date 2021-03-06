const db = require("../../data/dbConfig");

module.exports = {
  getAll,
  getAllMed,
  addUser,
  addMedPro,
  findUserBy,
  findMedBy,
};

function getAll() {
  return db("users");
}

function getAllMed() {
  return db("medical_professionals");
}

function addUser(item) {
  return db("users")
    .insert(item)
    .then(ids => ({ id: ids[0] }));
}

function addMedPro(item) {
  return db("medical_professionals")
    .insert(item)
    .then(ids => ({ id: ids[0] }));
}

function findUserBy(filter) {
  return db("users").where(filter);
}

function findMedBy(filter) {
  return db("medical_professionals").where(filter);
}
