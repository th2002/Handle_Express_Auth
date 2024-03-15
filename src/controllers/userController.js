/** GET:  http://localhost:3000/api/v1/user/example123 */
export const getUser = async (req, res) => {
  res.json("get user route");
};

/** PUT:  http://localhost:3000/api/v1/user/example123
 * @params : {
  "id": "<userid>",
}
 * @body : {
  fullname?: "",
  phone_number?: "",
}
 */
export const updateUser = async (req, res) => {
  res.json("update user route");
};

