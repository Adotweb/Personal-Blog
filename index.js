const express = require("express");
const fs = require("fs");
const path = require("path");
const marked = require("marked");
const hljs = require("highlight.js");
const katex = require("katex");

const app = express();
app.use(express.static("public")); // Serve static files like CSS

// Configure marked
marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: (code, lang) => {
        return lang && hljs.getLanguage(lang) ? hljs.highlight(code, { language: lang }).value : code;
    },
    langPrefix: "hljs language-",
    breaks: true,
});

// Custom renderer to support KaTeX
const renderer = new marked.Renderer();
renderer.paragraph = ({text}) => {
	console.log(text)
    return text.replace(/\$\$(.*?)\$\$/g, (_, math) => {
        return katex.renderToString(math, { throwOnError: false });
    });
};

marked.use({ renderer });




app.get("/", (req, res) => {
	
	let files = fs.readdirSync(__dirname + "/posts");	

	console.log(files)



	res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Markdown Render</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-light.css">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css">
                <style>
                    body { padding: 20px; max-width: 800px; margin: auto; }
                    .markdown-body { box-shadow: 0px 0px 8px rgba(0,0,0,0.1); padding: 20px; border-radius: 5px; }
                </style>
            </head>
            <body>
                <article class="markdown-body">
			${marked.parse("# Alims blog on very important stuff \n " + 
				files.map(file => ` - [${file.replace(".md", "") }](/${file})`).join("\n")
			)}
		</article>
            </body>
            </html>
        `);


})


// Route to render Markdown
app.get("/:name", (req, res) => {
    const mdFile = path.join(__dirname, "posts/" + req.params.name);
    fs.readFile(mdFile, "utf8", (err, data) => {
        if (err){
		console.log(err)
		return res.status(500).send("Error loading file");
	}
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Markdown Render</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-light.css">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css">
                <style>
                    body { padding: 20px; max-width: 800px; margin: auto; }
                    .markdown-body { box-shadow: 0px 0px 8px rgba(0,0,0,0.1); padding: 20px; border-radius: 5px; }
                </style>
            </head>
            <body>
                <article class="markdown-body">${marked.parse(data)}</article>
            </body>
            </html>
        `);
    });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
