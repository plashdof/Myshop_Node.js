const express =require('express');
const app = express();
const mysql = require('mysql')
var bodyParser = require('body-parser');
const fs = require('fs');

// CORS 해결
const cors = require('cors');
app.use(cors());
app.use(express.json());
const multer = require('multer'); // 파일 업로드를 처리하기 위한 미들웨어
// 파일 업로드를 처리할 미들웨어 설정
const upload = multer({ dest: 'uploads/' });



var connection = mysql.createConnection({
    // 엔드포인트
    host: "localhost",

    // 사용자명
    user: "root",

    // 데이터베이스 이름
    database: "hwdb",

    // 비번
    password:"jt8026jt97!",
})


// 서버 테스트용 get API

app.get('/', (req,res)=>{
    const result = {
        userId : 1234,
        userPwd : "1234"
    }
    res.send(result);
})

// 유저 회원가입
app.post('/user/join', (req, res) => {
    console.log(req.body);
    var nick = req.body.nick;
    var name = req.body.name;
    var email = req.body.email;
    var id = req.body.id;
    var pw = req.body.pw;

    // 삽입을 수행하는 sql문.
    var sql = 'INSERT INTO members (nick,name,email,id,pw) VALUES (?, ?, ?, ?, ?)';
    var params = [nick,name,email,id,pw];

    // sql 문의 ?는 두번째 매개변수로 넘겨진 params의 값으로 치환된다.
    connection.query(sql, params, function (err, result) {
        var resultCode = 404;
        var message = '에러가 발생했습니다';

        if (err) {
            console.log(err);
        } else {
            resultCode = 200;
            message = '회원가입에 성공했습니다.';
        }

        res.json({
            'code': resultCode,
            'message': message
        });
    });
});

// 유저 로그인
app.post('/user/login', (req, res) => {
    console.log(req.body);

    var id = req.body.id;
    var pw = req.body.pw;

    // 삽입을 수행하는 sql문.
    var sql = 'SELECT * FROM members WHERE id = ? AND pw = ?';
    var params = [id,pw];

    connection.query(sql, params, function (err, result) {
        var resultCode = 404;
        var message = '에러가 발생했습니다';
        var uuid = "";

        if (err) {
            console.log(err);
        } else {
            if (result.length > 0) { // 검증 결과가 존재하는 경우
                resultCode = 200;
                message = '로그인에 성공했습니다.';
                uuid=id;
              } else { // 검증 결과가 없는 경우
                resultCode = 204;
                message = '아이디와 비밀번호를 확인해주세요.';
              }
        }

        res.json({
            'code': resultCode,
            'message': message,
            'uuid':uuid
        });
    });
});


// 아이템 등록
app.post('/admin/setitem', upload.single('image'), (req, res) => {
    console.log(req.body)
    const { name, price, discount } = req.body; // 폼 데이터에서 필요한 값들을 추출
    const file = req.file; // 업로드된 파일 객체

    // 파일 데이터를 읽어옴
    const fileData = fs.readFileSync(file.path);

    // 삽입을 수행하는 sql문.
    var sql = 'INSERT INTO items (img,name,price,discount) VALUES (?, ?, ?, ?)';
    var params = [fileData,name,price,discount];

    // sql 문의 ?는 두번째 매개변수로 넘겨진 params의 값으로 치환된다.
    connection.query(sql, params, function (err, result) {
        var resultCode = 404;
        var message = '에러가 발생했습니다';

        if (err) {
            console.log(err);
        } else {
            resultCode = 200;
            message = '상품등록 성공.';
        }

        res.json({
            'code': resultCode,
            'message': message
        });
    });

  });

// 아이템 삭제
app.post('/admin/deleteitem', (req, res) => {
    console.log(req.body)

    // 삽입을 수행하는 sql문.
    var sql = 'DELETE FROM items WHERE id = ?';
    var params = [req.body.id];

    // sql 문의 ?는 두번째 매개변수로 넘겨진 params의 값으로 치환된다.
    connection.query(sql, params, function (err, result) {
        var resultCode = 404;
        var message = '에러가 발생했습니다';

        if (err) {
            console.log(err);
        } else {
            resultCode = 200;
            message = '상품삭제 성공.';
        }

        res.json({
            'code': resultCode,
            'message': message
        });
    });

});

// 아이템 수정
app.post('/admin/updateitem', (req, res) => {
    console.log(req.body)
    const { name, price, discount, id } = req.body; // 폼 데이터에서 필요한 값들을 추출


    // 삽입을 수행하는 sql문.
    var sql = 'UPDATE items SET  name = ?, price = ?, discount = ? WHERE id = ?';
    var params = [name,price,discount,id];

    // sql 문의 ?는 두번째 매개변수로 넘겨진 params의 값으로 치환된다.
    connection.query(sql, params, function (err, result) {
        var resultCode = 404;
        var message = '에러가 발생했습니다';

        if (err) {
            console.log(err);
        } else {
            resultCode = 200;
            message = '상품등록 성공.';
        }

        res.json({
            'code': resultCode,
            'message': message
        });
    });

    });


// 아이템 불러오기
app.get('/home/getitem', (req, res) => {

    let sql = 'SELECT * FROM items';

    connection.query(sql, function (err, rows) {
    const items = rows.map((row) => {
        // 각 행을 객체로 변환
        return {
            name: row.name,
            price: row.price,
            discount: row.discount,
            img : row.img,
            id : row.id 
            // 필요한 다른 속성들도 추가 가능
        };
        });
      res.send(items);
    });
});


// 선택 아이템 불러오기
app.get('/home/getoneitem', (req, res) => {
    var id = req.header('id');
    let sql = 'SELECT * FROM items WHERE id = ?';
    var params = [id]

    connection.query(sql, params, function (err, rows) {
    const items = {
            name: rows[0].name,
            price: rows[0].price,
            discount: rows[0].discount,
            img : rows[0].img,
            id : rows[0].id 
            // 필요한 다른 속성들도 추가 가능
        };
      res.send(items);
    });
});



// 검색아이템 불러오기
app.get('/home/getsearchitem', (req, res) => {
    var search = req.header('search');
    let sql = 'SELECT * FROM items WHERE name = ?';
    params = [search]
    
    connection.query(sql, params, function (err, rows) {
    const items = rows.map((row) => {
        // 각 행을 객체로 변환
        return {
            name: row.name,
            price: row.price,
            discount: row.discount,
            img : row.img,
            id : row.id 
            // 필요한 다른 속성들도 추가 가능
        };
        });
      res.send(items);
    });
});


// 장바구니 불러오기
app.get('/home/getcart', (req, res) => {

    var uuid = req.header('id');
    let sql = 'SELECT * FROM carts WHERE uuid = ?';
    var params = [uuid]

    connection.query(sql, params, function (err, rows) {
    const items = rows.map((row) => {
        // 각 행을 객체로 변환
        return {
            id : row.id,
            uuid : row.uuid,
            itemid : row.itemid,
            name: row.name,
            price: row.price,
            discount: row.discount,
        };
        });
      res.send(items);
    });
});

// 장바구니 추가
app.post('/home/addcart', (req, res) => {
    console.log(req.body)
    const { uuid, itemid, name, price, discount } = req.body; // 폼 데이터에서 필요한 값들을 추출

    // 삽입을 수행하는 sql문.
    var sql = 'INSERT INTO carts (uuid,itemid,name,price,discount) VALUES (?, ?, ?, ?, ?)';
    var params = [uuid,itemid,name,price,discount];

    // sql 문의 ?는 두번째 매개변수로 넘겨진 params의 값으로 치환된다.
    connection.query(sql, params, function (err, result) {
        var resultCode = 404;
        var message = '에러가 발생했습니다';

        if (err) {
            console.log(err);
        } else {
            resultCode = 200;
            message = '상품등록 성공.';
        }

        res.json({
            'code': resultCode,
            'message': message
        });
    });

  });

// 장바구니 삭제
app.post('/home/deletecart', (req, res) => {
    console.log(req.body)

    // 삭제 수행 sql 문
    var sql = 'DELETE FROM carts WHERE id = ?';
    var params = [req.body.id];

    // sql 문의 ?는 두번째 매개변수로 넘겨진 params의 값으로 치환된다.
    connection.query(sql, params, function (err, result) {
        var resultCode = 404;
        var message = '에러가 발생했습니다';

        if (err) {
            console.log(err);
        } else {
            resultCode = 200;
            message = '상품삭제 성공.';
        }

        res.json({
            'code': resultCode,
            'message': message
        });
    });

});



// user profile 정보 불러오기
app.get('/user/profile', (req, res) => {

    let id = req.header('id');
    let sql = 'SELECT * FROM members where id=?';
    console.log(id);

    connection.query(sql, id, function (err, rows) {
      const profile = {
        id: rows[0].id,
        name: rows[0].name,
        pw: rows[0].pw,
        nick: rows[0].nick,
        email: rows[0].email
      }
      res.send(profile);
    });
});


app.listen(8080,function(){
    console.log('listening on 8080');
})