const express = require('express');
const router = express.Router();
const { loginAdmin, changePassword } = require('../controllers/adminController');
const validate = require('../middleware/validate');
const { loginUserSchema,changePasswordSchema  } = require('../validations/userValidation');
const auth = require('../middleware/auth');
// const { getMe } = require('../controllers/userController');



router.post('/login', validate(loginUserSchema), loginAdmin);


// router.post('/login', validate(loginUserSchema), loginAdmin);

router.post('/change-password', validate(changePasswordSchema), auth, changePassword);



module.exports = router;