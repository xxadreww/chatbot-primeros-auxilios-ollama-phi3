const $=id=>document.getElementById(id);
const chat=$('chat'), input=$('mensaje'), file = $('file-input'), modal=$('modal-detalles');
let memoria = [{ 
    role: 'system', 
    content: `Eres un asistente medico experto en primeros auxilios.
    Advierte siempre al usuario que si hay riesgo vital, llame al 911 antes de seguir instrucciones.
    Siempre contesta en español y nunca te salgas de tu rol.
    Evita tecnicismos innecesarios.
    No recetes medicamentos bajo ninguna circunstancia.
    Si el usuario menciona temas fuera de tu rol (videojuegos, belleza, etc.), responde que no estás capacitado para ello y que solo estás programado para primeros auxilios.` 
}];

const addMsg=(text, type)=>{
    const div=document.createElement('div');
    div.className=`message ${type}`;
    const format=text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    div.innerHTML=type==='bot' ? 
        `<div class="avatar-placeholder"><img src="logo.png" style="width:100%;height:100%;object-fit:contain;"></div><div class="message-content"><p>${format}</p></div>` :
        type === 'system' ? `<div class="message-content"><p><strong>Aviso:</strong> ${text}</p></div>` :
        `<div class="message-content"><p>${format}</p></div>`;
    chat.appendChild(div);
    chat.scrollTop=chat.scrollHeight;
    return div;
};

const addTyping=()=>{
    const div=document.createElement('div');
    div.className='message bot typing';
    div.innerHTML=`<div class="avatar-placeholder"><img src="logo.png" style="width:100%;height:100%;object-fit:contain;"></div><div class="typing-dots"><span></span><span></span><span></span></div>`;
    chat.appendChild(div);
    chat.scrollTop=chat.scrollHeight;
    return div;
};

async function enviar(){
    const text=input.value.trim();
    if(!text) return;
    addMsg(text, 'user');
    memoria.push({ role: 'user', content: text });
    input.value='';
    const loader=addTyping();
    try{
        const res=await fetch('http://localhost:11434/api/chat',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({
                model:'phi3',
                messages:memoria,
                stream:false,
                options:{temperature:0.2}})});
        const data=await res.json();
        const reply=data.message.content;
        loader.remove();
        addMsg(reply, 'bot');
        memoria.push({ role: 'assistant', content: reply });
    } catch{loader.remove();
        addMsg("Error al conectar con Ollama local.", 'bot');}
}
input.addEventListener('keypress', e=>e.key==='Enter'&&enviar());
file.addEventListener('change', e=>{
    if(e.target.files.length) addMsg(`Se intentó cargar "${e.target.files[0].name}". Este modelo (phi3) no analiza imágenes directamente, describe la situación textualmente.`, 'system');
    file.value='';
});
$('btn-detalles').onclick=()=>modal.style.display="block";
document.querySelector('.close-btn').onclick=()=>modal.style.display="none";
window.onclick=e=>{if(e.target===modal)modal.style.display="none";};