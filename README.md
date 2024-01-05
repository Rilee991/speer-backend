# Spree Backend Challenge
# author - Rohit Kumar

This is an express nodejs app created for spree backend challenge
Challenge Link - https://miro.com/app/board/uXjVMJK4wq0=/?openCardPanel=3458764574685939969

Steps to set up project in your local machine

1. clone the project from - https://github.com/Rilee991/speer-backend.git
2. move inside the project - cd spree-backend
3. do npm install
4. copy the env values that is shared over mail and paste into .env file inside speer-backend directory
5. do npm start and you'll see same instances of nodejs depending on your machine's number of cores making it scalable and improved performance.
6. If you want to see test results you can run yarn test
7. To test apis yourself and see response you can import the Speer apis.postman_collection.json file into your postman and run the apis on local.
8. To test on postman create a new user using any email and password and it'll return a jwt
9. Copy the jwt to any notes api you want to test in the request header set key as "Cookie" and value as jwt={token}

# Hope you like it and have a good day! Feel free to ping me for any clarifications.