const Users = require("../models/users");
const { OAuth2Client } = require('google-auth-library');
async function obtainTokenWithId(code) {
    try {
        const oAuth2Client = new OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
        const r = await oAuth2Client.getToken(code);
        return r.tokens;
    } catch (e) {
        console.log(e);
        console.log("failed")
        return null;
    }


};
exports.signUp = async (req, res, next) => {
    // console.log(req.body);
    try {
        var { username, password, email, name } = req.body;
        if (username == "") throw new Error("username can't be blank");
        if (password == "") throw new Error("password can't be blank");
        if (name == "") throw new Error("Name can't be blank");
        user = await Users.findOne({ $or: [{ username }, { email: email }] });
        if (user !== null) {
            console.log("Already exists");
            res.setHeader("Content-Type", "application/json");
            res.status(400);
            res.json({ error: "User with that username or email already exists!!" });
            return res;
        }
        newUser = await Users.create({
            username,
            password,
            email,
            name
        })
        console.log(newUser);
        var token = await newUser.generateAuthToken();
        res.setHeader("Content-Type", "application/json");
        res.status(200);
        res.json({ token: token, message: "Successfully Signed Up!" });
    } catch (e) {
        console.log(e.message);
        res.status(403).send({ error: e.message });
    }
};

exports.loginUser = async (req, res, next) => {
    try {
        if (req.body.username === "") throw new Error("username can't be blank");
        const user = await Users.findByCredentials(req.body.username, req.body.password);
        const token = await user.generateAuthToken();
        var data = {
            _id: user._id,
            message: "Successfully logged in!",
            name: user.name,
            username: user.username,
            email: user.email,
            token: token,
            expiresIn: 36000,
        }
        res.status(200).send(data);
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
};

exports.googleLogin = async (req, res) => {
    try {
        var tokens = await obtainTokenWithId(req.body.code);
        var googleAccessToken = tokens.access_token;
        var googleRefreshToken = tokens.refresh_token;
        const client = new OAuth2Client(process.env.CLIENT_ID);
        async function verify() {
            const ticket = await client.verifyIdToken({
                idToken: tokens.id_token,
                audience: process.env.CLIENT_ID
            });
            const payload = ticket.getPayload();
            const userid = payload['sub'];

            const user = await Users.findOne({ email: payload['email'] });
            if (!user) {
                var username = payload['email'];
                var email = payload['email'];
                console.log(email);
                var googleId = userid;
                var name = payload['name'];
                newUser = await Users.create({
                    username,
                    email,
                    name,
                    googleId,
                    googleAccessToken,
                    googleRefreshToken,
                    expiresIn: tokens.expires_in
                })
                var token = await newUser.generateAuthToken();
                var data = {
                    _id: newUser._id,
                    message: "Successfully logged in!",
                    name: newUser.name,
                    username: newUser.username,
                    email: newUser.email,
                    token: token,
                    expiresIn: 36000,
                }
                res.status(200).send(data);
            } else {
                user.googleAccessToken = googleAccessToken;
                user.googleRefreshToken = googleRefreshToken;
                const token = await user.generateAuthToken();
                var data = {
                    _id: user._id,
                    message: "Successfully logged in!",
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    token: token,
                    expiresIn: 36000,
                }
                user.save();
                res.status(200).send(data);
            }
        }
        verify().catch(console.error);
    } catch (e) {
        console.log(e);
        res.status(403).send({ error: "Login failed try again later" })
    }
}