// const { users } = require("../db/schema/user.schema.js");

// const getData = require("../utils/commonDBFn");

import {users} from "../db/schema/user-schema.js";
import { sendResponse } from "../utils/ReqResHelperFn.js";
import { TryCatchBlocker } from "../utils/TryCatchWrapper.js"
import {getData} from "../utils/commonDBFn.js";


export const Login = TryCatchBlocker(
    async function (req, res) {
        let {email,password} = req.body;
        console.log(email, password, 'email and password in login controller');
        const checkUser = await getData('users', { query : {email} });

        if (!checkUser?.length) return sendResponse(req, res, { status: "failed", message: "User already exists", code: 409, success: false });
        sendResponse(req, res, { data: checkUser, message: 'Succesfully login users' })
    }
); 

export const Register = TryCatchBlocker(
    async function (req, res) {
        let { email, password } = req.body;
        console.log(email, password, 'email and password in login controller');
        const checkUser = await getData(users, { email });
        if (checkUser?.length) return sendResponse(req, res, { status: "failed", message: "User already exists", code: 409 });
        sendResponse(req, res, { data: checkUser, message: 'Succesfully login users' })
    }
); 

export const ForgotPassword = TryCatchBlocker(
    async function (req, res) {
        let { email, password } = req.body;
        console.log(email, password, 'email and password in login controller');
        const checkUser = await getData(users, { email });
        if (checkUser?.length) return sendResponse(req, res, { status: "failed", message: "User already exists", code: 409 });
        sendResponse(req, res, { data: checkUser, message: 'Succesfully login users' })
    }
); 