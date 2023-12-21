import axios from 'axios';

const URI = 'http://localhost:8080/api/user/1';

function fetchUser() {
   try {
    axios.get(URI)
    .then((response) => console.log('Retrieved User: ' + JSON.stringify(response.data)))

   } catch (error) {
        console.log("ERROR: " + error);
   }
}

fetchUser();