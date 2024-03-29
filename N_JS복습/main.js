var http = require('http');
var url = require('url');
var fs = require('fs');
var qs = require('querystring');

var template = {
    html : function(title, list, control, body){
        return `
        <!doctype html>
            <html>
            <head>
                <title>WEB1 - ${title}</title>
                <meta charset="utf-8">
            </head>
            <body>
                <h1><a href="/">WEB</a></h1>
                <ol>
                    ${list}
                </ol>
                ${control}
                ${body}
            </body>
        </html>
    `
    },
    list : function(filelist){
        var i=0;
        var list ='';
        while(filelist.length > i){
            list += `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
            i++;
        }
        return list;
    }
}

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url,true).query;
    var pathname = url.parse(_url,true).pathname;
    

    if(pathname == '/'){
        if(queryData.id === undefined){
            fs.readdir('./data','utf-8',function(err, filelist){
                var title = 'Welcome';
                var description = 'Hello NodeJS...';
                var list = template.list(filelist);
                var html = template.html(title, list, '<a href=/create>create</a>',`<h2>${title}</h2>${description}`);

                response.writeHead(200);
                response.end(html);
            });
        } else {
            fs.readdir(`./data`,'utf-8',function(err2, filelist){
                fs.readFile(`data/${queryData.id}`,'utf-8',function(err, description){
                    var title = queryData.id;
                    var list = template.list(filelist);
                    var html = template.html(title, list, `<a href=/create>create</a> <a href="/update?id=${title}">update</a>
                    <form action="/delete_process?id=${title}" method="post">
                        <input type="hidden" name="title" value="${title}">
                        <input type="submit" value="delete">
                    </form>
                    `,`<h2>${title}</h2>${description}`);

                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    } else if(pathname === '/create'){
        fs.readdir('./data','utf-8',function(err, filelist){
            var title = 'WEB - create';
            var list = template.list(filelist);
            var html = template.html(title, list, '',`
                <form action="/create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p><textarea placeholder="description" name="description"></textarea></p>
                    <input type="submit" value="create">
                </form>
            `);

            response.writeHead(200);
            response.end(html);
        });
    } else if(pathname === '/create_process'){
        var body = '';
        request.on('data',function(data){
            body += data;
        })
        request.on('end', function(){
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            fs.writeFile(`data/${title}`,description, function(err){
                response.writeHead(302,{Location:`/?id=${title}`});
                response.end('Success');
            });
            
        });
    } else if(pathname === '/update'){
        
        fs.readdir(`./data`,'utf-8',function(err2, filelist){
            fs.readFile(`data/${queryData.id}`,'utf-8',function(err, description){
                var title = queryData.id;
                var list = template.list(filelist);
                var html = template.html(title, list, '<a href=/create>create</a><a href="/update">update</a>', `
                <form action="/update_process" method="post">
                    <p><input type="hidden" name="id" value="${title}"></p>
                    <p><input type="text" name="title" value="${title}" placeholder="title"></p>
                    <p><textarea name="description">${description}</textarea></p>
                    <input type="submit" value="update">
                </form>
            `);

                response.writeHead(200);
                response.end(html);
            });
        });
    } else if(pathname === '/update_process'){
        var body = '';
        request.on('data',function(data){
            body += data;
        })
        request.on('end', function(){
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;
            fs.rename(`data/${id}`, `data/${title}`, function(err){
                fs.writeFile(`data/${title}`, description, function(err2){
                    response.writeHead(302,{Location:`/?id=${title}`});
                    response.end('Success');
                });
            });
            
        });
    } else if(pathname === '/delete_process'){
        var body = '';
        request.on('data',function(data){
            body += data;
        })
        request.on('end', function(){
            var post = qs.parse(body);
            var title = post.title;
            fs.unlink(`data/${title}`,function(err){
                response.writeHead(302,{Location:`/`});
                response.end('Success');
            });
        });
    } else {
        response.writeHead(404);
        response.end('Not Found');
    }

    
});
app.listen(3000);