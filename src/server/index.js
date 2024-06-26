const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));

app.get('/api/greeting', (req, res) => {
    const locale = req.query.locale || 'en-US';
    console.log(locale);
    switch (locale) {
        case "zh-TW":
            msg = "你好嗎";
            break;
        default:
            msg = "Hello";
            break;
    }
    res.setHeader('Content-Type', 'application/json');
    res.send({ greeting: msg });
});


app.listen(60625, () =>
    console.log('Express server is running on localhost:' + 60625)
);