import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');

const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element){
  element.textContent = '';

  //función para que muestre los puntos suspensivos mientras carga la response

  loadInterval = setInterval(()=> {
    element.textContent+= '.';

    if(element.textContent === '....'){
      element.textContent= '';
    }
  }, 300)
};

//función para que muestre de a palabra(como escribiendo) y no toda la response instantánea

function typeText(element, text){
  let index=0;
 
  let interval = setInterval(()=>{
    if(index < text.length){
      element.innerHTML += text.charAt(index);
      index++;
    }else{
      clearInterval(interval);
    }
  },30)
};

// generar un único Id para cada mensaje, para poder hacer map
function generateUniqueId(){
  const timestamp = Date.now(); // se pone la fecha y hora -son únicos- para generar un id único
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16); // 16 caracteres

  return `id-${timestamp}-${hexadecimalString}`;
}

//función para mostrar el icono y color de fondo según quien escriba
function chatStripe (isAi, value, uniqueId){ // se usa template string porque necesitamos espacios
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
              <div class="chat">
                <div class="profile">
                  <img
                    src="${isAi ? bot : user}"
                    alt="${isAi ? 'bot' :'user'}"
                    </img>
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
              </div>
            </div>
    `
  )
};


const handleSubmit = async (e) =>{
  e.preventDefault(); // función que evita el reload por defecto del navegador al hacer un submit

  const data = new FormData(form);

  //chat del USUARIO

  //false es porque no es el chat delAI, y trae la data
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
  //limpiamos el text input
  form.reset();


  //chat del BOT

  //generamos el id para el msg
  const uniqueId = generateUniqueId();
  //es true porque el bot es el que escribe
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  //mientras el bot escribe scrollea para abajo para ver el msg
  chatContainer.scrollTop = chatContainer.scrollHeight;


  //para hacer un fetch del mensaje hay que depositar el valor en una variable
  const messageDiv = document.getElementById(uniqueId);

  //cargamos el msg en el loader
  loader(messageDiv);

  // fetch data desde el server => para tener la respuesta del bot

  // primer parametro con el local host, segundo parámetro con todas las opciones
  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt') //es lo que viene del area de texto de la pantalla
    })
  })

  clearInterval(loadInterval); //porque ya no lodeamos

  messageDiv.innerHTML = ''; // limpiamos las lineas de puntos interactivas

  if(response.ok){
    const data = await response.json(); //nos trae la respuesta del backend
    const parsedData = data.bot.trim(); //parseamos la response 

    typeText(messageDiv, parsedData);
    
  } else{
    const error = await response.text();
    messageDiv.innerHTML = "Ups! Algo anda mal..";
    alert(JSON.stringify(error));
  }
}

//para ver los cambios en el handlerSubmit tenemos que llamarlo escuchando a un evento en Submit
form.addEventListener('submit', handleSubmit);
//submit apretando enter y no el botón. 
//Keyup = apretar y soltar una tecla + llamamos a una funcion callback
form.addEventListener('keyup', (e)=>{
  if(e.keyCode === 13){ //13 es la clave para el enter
    handleSubmit(e);
  }
})