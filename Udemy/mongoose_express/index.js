const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const Product = require('./models/product');

mongoose.connect('mongodb://127.0.0.1:27017/farmStand')
    .then(()=>{
        console.log("CONNECTION OPEN!!");
    })
    .catch((err)=>{
        console.log("OH NO ERROR!!!!");
        console.log(err);
    });

// views 디렉토리 설정
app.set('views',path.join(__dirname, 'views'));
app.set('view engine','ejs');

// 미들웨어
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

// index 라우트 : 모든 상품 이름 보여주기
app.get('/products', async (req, res)=>{
    const products = await Product.find({});
    res.render('products/index', {products});
});

// new 라우트 : 상품 추가하기
app.get('/products/new', (req, res)=>{
    res.render('products/new');
});
app.post('/products', async (req, res)=>{
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.redirect(`products/${newProduct._id}`);
});

// 개별 요소 보기
app.get('/products/:id', async (req, res)=>{
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render('products/show', {product});
});

// 업데이트 라우트
app.get('/products/:id/edit', async (req, res)=>{
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render('products/edit', {product});
});
app.put('/products/:id', async (req, res)=>{
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {runValidators : true, new : true});
    res.redirect(`products/${product._id}`);
});

app.listen(3000, ()=>{
    console.log('APP IS LISTENING ON PORT 3000!');
});