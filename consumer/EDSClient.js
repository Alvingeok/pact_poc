const request = require("superagent");
const { CreateEntity } = require("./EDS");

const hostname = "127.0.0.1"
const authHeader = {
  Authorization: 'Bearer token',
};
const fetchEdsResponse = (entityBody) => {
  return request.post(`http://${hostname}:${process.env.API_PORT}/rspimcxh/productimport`)
  .send(entityBody)
  .set(authHeader)
  .set('Content-Type', 'application/json; charset=utf-8')
  .then(
    (res) => {
      return res.body.reduce((required, JsonResponse) => {
        required.push(new CreateEntity(JsonResponse.ctx_func_name, JsonResponse.ctx_invocation_id));
        return required;
      }, []);
    },
    (err) => {
      console.log(err)
      throw new Error(`Error from response: ${err.body}`);
    }
  );
};

module.exports = {
  fetchEdsResponse,
};
