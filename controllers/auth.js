const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const axios = require('axios')
const { UserSchema, SessionModel } = require('../model')
require('dotenv').config();


const register = async (req, res) => {
    const { email, password, name } = req.body;
    const existingUser = await UserSchema.findOne({ email });
    if (existingUser) {
        return res
            .status(409)
            .send({ message: `User with ${email} email already exists` });
    }
    const passwordHash = await bcrypt.hash(
        password,
        Number(process.env.HASH_POWER)
    );
    const newUser = await UserSchema.create({
        email,
        passwordHash,
        name
    });
    return res.status(201).send({
        email,
        username,
        id: newUser._id,
    });
};

const login = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await UserSchema.findOne({ email });
    if (!user) {
        return res
            .status(403)
            .send({ message: `User with ${email} email doesn't exist` });
    }
    if (!user.passwordHash) {
        return res.status(403).send({ message: "Forbidden" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
        return res.status(403).send({ message: "Password is wrong" });
    }
    const newSession = await SessionModel.create({
        uid: user._id,
    });
    const accessToken = jwt.sign(
        { uid: user._id, sid: newSession._id },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME,
        }
    );
    const refreshToken = jwt.sign(
        { uid: user._id, sid: newSession._id },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME,
        }
    );
    return UserSchema.findOne({ email })
        .exec((err, data) => {
            if (err) {
                next(err);
            }
            return res.status(200).send({
                accessToken,
                refreshToken,
                sid: newSession._id,
                data: {
                    email: data.email,
                    name: data.name,
                    id: data._id
                },
            });
        });
};

const authorize = async (req, res, next) => {
    const authorizationHeader = req.get("Authorization");
    if (authorizationHeader) {
        const accessToken = authorizationHeader.replace("Bearer ", "");
        let payload;
        try {
            payload = jwt.verify(accessToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).send({ message: "Unauthorized" });
        }
        const user = await UserSchema.findById((payload).uid);
        const session = await SessionModel.findById((payload).sid);
        if (!user) {
            return res.status(404).send({ message: "Invalid user" });
        }
        if (!session) {
            return res.status(404).send({ message: "Invalid session" });
        }
        req.user = user;
        req.session = session;
        next();
    } else return res.status(400).send({ message: "No token provided" });
};

const refreshTokens = async (req, res) => {
    const authorizationHeader = req.get("Authorization");
    if (authorizationHeader) {
        const activeSession = await SessionModel.findById(req.body.sid);
        if (!activeSession) {
            return res.status(404).send({ message: "Invalid session" });
        }
        const reqRefreshToken = authorizationHeader.replace("Bearer ", "");
        let payload;
        try {
            payload = jwt.verify(reqRefreshToken, process.env.JWT_SECRET);
        } catch (err) {
            await SessionModel.findByIdAndDelete(req.body.sid);
            return res.status(401).send({ message: "Unauthorized" });
        }
        const user = await UserSchema.findById((payload).uid);
        const session = await SessionModel.findById((payload).sid);
        if (!user) {
            return res.status(404).send({ message: "Invalid user" });
        }
        if (!session) {
            return res.status(404).send({ message: "Invalid session" });
        }
        await SessionModel.findByIdAndDelete((payload).sid);
        const newSession = await SessionModel.create({
            uid: user._id,
        });
        const newAccessToken = jwt.sign(
            { uid: user._id, sid: newSession._id },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME,
            }
        );
        const newRefreshToken = jwt.sign(
            { uid: user._id, sid: newSession._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME }
        );
        return res
            .status(200)
            .send({ newAccessToken, newRefreshToken, newSid: newSession._id });
    }
    return res.status(400).send({ message: "No token provided" });
};
const logout = async (req, res) => {
    const currentSession = req.session;
    await SessionModel.deleteOne({ _id: (currentSession)._id });
    req.user = null;
    req.session = null;
    return res.status(204).end();
};

const googleAuth = async (req, res) => {
    const stringifiedParams = queryString.stringify({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: `${process.env.BASE_URL}/auth/google-redirect`,
        scope: [
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
        ].join(" "),
        response_type: "code",
        access_type: "offline",
        prompt: "consent",
    });
    return res.redirect(
        `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`
    );
};

const googleRedirect = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const urlObj = new URL(fullUrl);
    const urlParams = queryString.parse(urlObj.search);
    const code = urlParams.code;
    const tokenData = await axios({
        url: `https://oauth2.googleapis.com/token`,
        method: "post",
        data: {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: `${process.env.BASE_URL}/auth/google-redirect`,
            grant_type: "authorization_code",
            code,
        },
    });
    const userData = await axios({
        url: "https://www.googleapis.com/oauth2/v2/userinfo",
        method: "get",
        headers: {
            Authorization: `Bearer ${tokenData.data.access_token}`,
        },
    });
    let existingParent = await UserModel.findOne({ email: userData.data.email });
    if (!existingParent || !existingParent.originUrl) {
        return res.status(403).send({
            message:
                "You should register from front-end first (not postman). Google/Facebook are only for sign-in",
        });
    }
    const newSession = await SessionModel.create({
        uid: existingParent._id,
    });
    const accessToken = jwt.sign(
        { uid: existingParent._id, sid: newSession._id },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME,
        }
    );
    const refreshToken = jwt.sign(
        { uid: existingParent._id, sid: newSession._id },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME,
        }
    );
    return res.redirect(
        `${existingParent.originUrl}?accessToken=${accessToken}&refreshToken=${refreshToken}&sid=${newSession._id}`
    );
};
module.exports = { register, login, logout, authorize, refreshTokens, googleAuth, googleRedirect }