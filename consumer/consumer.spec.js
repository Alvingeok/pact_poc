// Setting up our test framework
const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

// We need Pact in order to use it in our test
const { provider } = require("../pact");
const { Pact, Matchers } = require('@pact-foundation/pact');

// Importing our system under test (the orderClient) and our Order model
const { CreateEntity } = require("./EDS");
const { fetchEdsResponse } = require("./EDSClient");



describe("Pact with EDS create entity API", () => {
  const { eachLike, like} = Matchers;
  describe("given the data from ces", () => {

    const requestBody = {
      ProductImportData: {
        ProductsToImport: [
          {
            Values: [
              {
                Name: 'Brand Owner GLN',
                ValuesByLocale: {
                  Id: '7868768798798'
                }
              },
              {
                Name: 'Discontinued Date',
                ValuesByLocale: {
                  Id: '04/30/2022 12:00:00 AM'
                }
              }

            ],
            MultiValues: [
              {

                Name: 'Trade Item Marketing Message',
                ValuesByLocale: {
                  Values: [
                    'value1',
                    'value2'
                  ]
                }

              }

            ]
          }
        ],
        ProductIdentifierProperty: 'Global Trade Item Number (GTIN)'
      },
      errorMode: 'Fail'
    }

    const EDSResponse = {
      status:'Success',
      response: 200,
      errors: [],
      messages: [
       'Event sent successfully to TenantId = qa1cxh with CompanyType = supplier'
      ],
      method: 'POST',
      ctx_func_name: 'CXH_RS_inbound',
      ctx_invocation_id: '05b83034-cf38-40ae-9542-d89dc379455e'
    }


    describe("when a call to the API is made", () => {
      before(() => {
        provider
          .given("there are orders")
          .uponReceiving("a request for orders")
          .withRequest({
            method: "POST",
            path: "/rspimcxh/productimport",
            body: like(requestBody),
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              Authorization: like('Bearer token'),
            },
          })
          .willRespondWith({
            body: eachLike(EDSResponse),
            status: 200,
            headers: {
              "Content-Type": "application/json; charset=utf-8"
            },
          });


console.log(provider)

      });

      it("will respond with entity ID's", () => {
        return provider.executeTest((mockserver) => {
          // The mock server is started on a randomly available port,
          // so we set the API mock service port so HTTP clients
          // can dynamically find the endpoint
          process.env.API_PORT = mockserver.port;
          return expect(fetchEdsResponse(requestBody)).to.eventually.have.deep.members([
            new CreateEntity(EDSResponse.ctx_func_name, EDSResponse.ctx_invocation_id),
          ]);
        });
      });
    });
  });
});