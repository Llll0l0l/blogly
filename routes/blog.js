const express = require("express");

const db = require("../data/database");

const router = express.Router();

router.get("/", function(req, res, next) {
    res.redirect("/posts");
});

router.get("/posts", async function(req, res, next) {
    posts = await db.query(
        "SELECT posts.*, blog_authors.name AS author_name FROM posts JOIN blog_authors ON posts.author_id = blog_authors.id;"
    );
    // res.render('post-detail', { posts: posts[0] });
    res.render("posts-list", { posts: posts[0] });
});

router.get("/new-post", async function(req, res, next) {
    const [authors] = await db.query("SELECT * FROM blog_authors");
    res.render("create-post", { authors: authors });
});

router.post("/posts", async function(req, res) {
    const data = [
        req.body.title,
        req.body.summary,
        req.body.content,
        req.body.author,
    ];
    await db.query(
        "INSERT INTO posts (title, summary, body, author_id) VALUES (?)", [data]
    );
    res.redirect("/posts");
});

router.get("/posts/:id", async function(req, res, next) {
    const [posts] = await db.query(
        "SELECT posts.*, blog_authors.name AS author_name, blog_authors.email AS author_email FROM posts JOIN blog_authors ON posts.author_id = blog_authors.id WHERE posts.id = ?", [req.params.id]
    );

    if (!posts || posts.length === 0) {
        return res.status(404).render("404");
    }

    const postData = {
        ...posts[0],
        post_date: posts[0].post_date.toISOString(),
        humanReadableDate: posts[0].post_date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }),
    };

    res.render("post-detail", { post: postData });
});

router.get("/posts/:id/edit", async function(req, res) {
    const [posts] = await db.query("SELECT * FROM posts WHERE id = ?", [
        req.params.id,
    ]);

    if (!posts || posts.length === 0) {
        return res.status(404).render("404");
    }

    res.render("update-post", { post: posts[0] });
});

router.post("/posts/:id/edit", async function(req, res) {


    await db.query(
        "UPDATE posts SET title = ?, summary = ?, body = ? WHERE id = ?", [
            req.body.title,
            req.body.summary,
            req.body.content,
            req.params.id
        ]
    );

    res.redirect("/posts");
});


router.post("/posts/:id/delete", async function(req, res) {
    await db.query("DELETE FROM posts WHERE id = ?", [req.params.id]);
    res.redirect("/posts");
});

module.exports = router;