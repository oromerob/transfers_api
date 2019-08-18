# Transfers API


To start the app:
```bash
docker-compose up -d
```

To access Swagguer UI:

http://localhost:8080/docs/swagger

In order to have accounts to play with you can access mongodb at localhost:27107 and add a couple of users.

User example:
```json
{
  "_id": "123123123",
  "amount": 500
}
``` 

Then you can interact with the API through the Swagger interface or programatically to port 8080.