const express = require("express");
const router = express.Router();
const user = require("./authModel.js");
const bcrypt = require("bcryptjs");
const secret = require("../../Secrets/secret");
const jwt = require("jsonwebtoken");
const generateMedToken = require("./MedToken");

//get all user
router.get("/all", (req, res) => {
  user
    .getAll()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(error => {
      res.status(500).json({ message: "Error fetching all users" });
    });
});

//get all medical prof
router.get("/allmed", (req, res) => {
  user
    .getAllMed()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(error => {
      res.status(500).json({ message: "Error fetching all users" });
    });
});

router.post("/user-register", (req, res) => {
  let creds = req.body;

  if (!creds.userEmail || !creds.userPassword || !creds.userName) {
    res.status(404).json({
      message:
        "Email, password, and name are required for registering an account",
    });
  } else {
    const hash = bcrypt.hashSync(creds.userPassword, 8);
    creds.userPassword = hash;
    user
      .addUser(creds)
      .then(user => {
        res.status(201).json(user);
      })
      .catch(error => {
        res
          .status(500)
          .json({ errorMessage: "Error registering user account to server" });
      });
  }
});

router.post("/med-register", (req, res) => {
  let medCreds = req.body;
  // console.log(medCreds);
  if (
    !medCreds.medicEmail ||
    !medCreds.medicPassword ||
    !medCreds.medicFirstName ||
    !medCreds.medicLastName ||
    !medCreds.company ||
    !medCreds.position
  ) {
    res.status(404).json({
      message:
        "Email, password, name, company and position are required for registering an account",
    });
  } else {
    const hash = bcrypt.hashSync(medCreds.medicPassword, 8);
    medCreds.medicPassword = hash;
    // console.log(medCreds);
    user
      .addMedPro(medCreds)
      .then(pro => {
        console.log(pro);
        res.status(201).json(pro);
      })
      .catch(error => {
        res.status(500).json({
          errorMessage:
            "Error registering medical professional account to server",
        });
      });
  }
});

router.post("/user-login", (req, res) => {
  let { userEmail, userPassword } = req.body;
  let { id } = req.params;

  if (!userEmail || !userPassword) {
    res.status(401).json({ message: "Missing email and password for login" });
  } else {
    user
      .findUserBy({ userEmail })
      .first()
      .then(user => {
        // console.log(user);
        if (user && bcrypt.compareSync(userPassword, user.userPassword)) {
          const token = generateToken(user);
          res
            .status(200)
            .json({ id: user.id, message: `Welcome ${user.userName}`, token });
        } else {
          res.status(401).json({ message: "Invalid User Credentials" });
        }
      })
      .catch(error => {
        res.status(500).json({ errorMessage: "Error user login to server" });
      });
  }
});

router.post("/med-login", (req, res) => {
  const { medicEmail, medicPassword } = req.body;
  console.log(req.body);
  if (!medicEmail || !medicPassword) {
    res
      .status(404)
      .json({ message: "Email and password are required for login" });
  } else {
    user
      .findMedBy({ medicEmail })
      .first()
      .then(pro => {
        if (pro) {
          const medtoken = generateMedToken(pro);
          console.log(medtoken);
          res.status(200).json({
            id: pro.id,
            message: `Welcome, ${pro.position}`,
            medtoken,
          });
        } else {
          res
            .status(401)
            .json({ message: "Invalid Medical Professional Credentials" });
        }
      })
      .catch(error => {
        res.status(500).json({
          errorMessage: "Medical Professional failed to login to the server",
        });
      });
  }
});

function generateToken(user) {
  const payload = {
    subject: user.id,
    type: "user",
  };
  const options = {
    expiresIn: "8h",
  };
  return jwt.sign(payload, secret.jwtSecret, options);
}

module.exports = router;
