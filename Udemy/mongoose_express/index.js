const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const AppError = require('./AppError');

const Product = require('./models/product');
const Farm = require('./models/farm');

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

// FARM ROUTES

app.get('/farms', async (req, res)=>{
    const farms = await Farm.find({});
    res.render('farms/index', {farms});
})

app.get('/farms/new', (req, res)=>{
    res.render('farms/new');
})

app.get('/farms/:id', async (req, res)=>{
    const farm = await Farm.findById(req.params.id).populate('products');
    res.render('farms/show', {farm});
})

app.delete('/farms/:id', async (req, res)=>{
    const farm = await Farm.findByIdAndDelete(req.params.id);
    res.redirect('/farms');
})

app.post('/farms', async (req, res)=>{
    const farm = new Farm(req.body);
    await farm.save();
    res.redirect('/farms');
})

app.get('/farms/:id/products/new', async (req, res) => {
    const { id } = req.params;
    const farm = await Farm.findById(id);
    res.render('products/new', {categories, farm});
})

app.post('/farms/:id/products', async (req, res) => {
    const {id} = req.params;
    const farm = await Farm.findById(id);
    const { name, price, category } = req.body;
    const product = new Product({ name, price, category });
    farm.products.push(product);
    product.farm = farm;
    await farm.save();
    await product.save();
    res.redirect(`/farms/${id}`);
})

// PRODUCT ROUTES

// 카테고리
const categories = ['fruit', 'vegetable', 'dairy'];

// index 라우트 : 모든 상품 이름 보여주기
app.get('/products', async (req, res)=>{
    const {category} = req.query;
    if(category){
        const products = await Product.find({category});
        res.render('products/index', {products, category});
    } else {
        const products = await Product.find({});
        res.render('products/index', {products, category : 'All'});
    }
});

// new 라우트 : 상품 추가하기
app.get('/products/new', (req, res)=>{
    res.render('products/new', {categories});
});
app.post('/products', async (req, res)=>{
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.redirect(`products/${newProduct._id}`);
});

function wrapAsync(fn){
    return function(req, res, next){
        fn(req, res, next).catch(e=> next(e));
    }
}

// 개별 요소 보기
app.get('/products/:id', wrapAsync(async (req, res, next)=>{
    const { id } = req.params;
    const product = await Product.findById(id).populate('farm', 'name');
    if(!product){
        return next(new AppError('Product Not Found!', 403));
    }
    res.render('products/show', {product});
}));

// 업데이트 라우트
app.get('/products/:id/edit', async (req, res)=>{
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render('products/edit', {product, categories});
});
app.put('/products/:id', async (req, res)=>{
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {runValidators : true, new : true});
    res.redirect(`products/${product._id}`);
});

app.delete('/products/:id', async (req, res)=>{
    const { id } = req.params;
    const deleteProduct = await Product.findByIdAndDelete(id);
    res.redirect(`/products`);
});

const handleValidationErr = err => {
    console.dir(err);
    return new AppError(`Validation Failed... ${err.message}`, 400)
}

//특정 경로 에러 검출
app.use((err, req, res, next)=>{
    console.log(err.name);
    if(err.name === 'ValidationError') err = handleValidationErr(err);
    next(err);
})

app.use((err, req, res ,next)=>{
    const {status=500, message='Something went wrong'} = err;
    res.status(status).send(message);
})

app.listen(3000, ()=>{
    console.log('APP IS LISTENING ON PORT 3000!');
});