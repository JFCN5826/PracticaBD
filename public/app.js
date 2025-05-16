// Variables globales
let pacientes = [];
let diagnosticos = [];
let ciudades = [];
let currentId = null;
let currentType = null;

// ===================== EXÁMENES =====================
let examenes = [];

// Funciones de utilidad
function mostrarAlerta(mensaje, tipo = 'danger') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.container').prepend(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

function mostrarSeccion(seccion) {
    document.querySelectorAll('.seccion').forEach(s => s.style.display = 'none');
    document.getElementById(`seccion-${seccion}`).style.display = 'block';
    if (seccion === 'pacientes') {
        cargarPacientes();
    } else {
        cargarDiagnosticos();
    }
}

// Funciones para Pacientes
document.getElementById('paciente-form').addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const id = document.getElementById('paciente-id').value;
    const data = {
        Id_Paciente: parseInt(document.getElementById('paciente-id').value),
        Nombre: document.getElementById('nombre').value,
        Direccion: document.getElementById('direccion').value,
        Numero_Telefono: parseInt(document.getElementById('telefono').value),
        Id_Ciudad: document.getElementById('ciudad').value // <---- Asegúrate de que el ID del select sea 'ciudad'
    };
    try {
        const url = id ? `/api/pacientes/${id}` : '/api/pacientes';
        const method = id ? 'PUT' : 'POST';
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al guardar el paciente');
        }
        await cargarPacientes(); 
        ocultarFormularioPaciente(); 
        mostrarAlerta('Paciente guardado exitosamente', 'success'); 
    } catch (error) {
        mostrarAlerta(error.message); 
    }
});

async function cargarPacientes() {
    try {
        const response = await fetch('/api/pacientes');
        if (!response.ok) throw new Error('Error al cargar pacientes');
        pacientes = await response.json();
        actualizarTablaPacientes();
    } catch (error) {
        mostrarAlerta('Error al cargar pacientes: ' + error.message);
    }
}

function actualizarTablaPacientes() {
    const tbody = document.getElementById('tabla-pacientes');
    tbody.innerHTML = '';
    pacientes.forEach(paciente => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${paciente.Id_Paciente}</td>
            <td>${paciente.Nombre}</td>
            <td>${paciente.Direccion}</td>
            <td>${paciente.Numero_Telefono}</td>
            <td>${paciente.Desc_Ciudad}</td>
            <td>
                <button class="btn btn-sm btn-primary btn-action" onclick="editarPaciente(${paciente.Id_Paciente})">Editar</button>
                <button class="btn btn-sm btn-danger btn-action" onclick="confirmarEliminacion(${paciente.Id_Paciente}, 'paciente')">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function mostrarFormularioPaciente() {
    document.getElementById('paciente-id').value = '';
    document.getElementById('paciente-form').reset();
    cargarCiudadesSelect();
    document.getElementById('formulario-paciente').style.display = 'block';
}

function ocultarFormularioPaciente() {
    document.getElementById('formulario-paciente').style.display = 'none';
}

async function editarPaciente(id) {
    try {
        const paciente = pacientes.find(p => p.Id_Paciente === id);
        if (!paciente) throw new Error('Paciente no encontrado');
        
        document.getElementById('paciente-id').value = paciente.Id_Paciente;
        document.getElementById('nombre').value = paciente.Nombre;
        document.getElementById('direccion').value = paciente.Direccion;
        document.getElementById('telefono').value = paciente.Numero_Telefono;
        document.getElementById('ciudad').value = paciente.Id_Ciudad;
        
        document.getElementById('formulario-paciente').style.display = 'block';
    } catch (error) {
        mostrarAlerta('Error al cargar datos del paciente: ' + error.message);
    }
}

async function cargarCiudadesSelect() {
    try {
        const response = await fetch('/api/ciudades');
        if (!response.ok) {
            throw new Error('Error al cargar ciudades');
        }
        const ciudades = await response.json();
        const selectCiudad = document.getElementById('ciudad');
        selectCiudad.innerHTML = '<option value="">Seleccione una ciudad</option>'; 

        ciudades.forEach(ciudad => {
            const option = document.createElement('option');
            option.value = ciudad.Id_Ciudades; 
            option.textContent = ciudad.Desc_Ciudad;
            selectCiudad.appendChild(option);
        });
    } catch (error) {
        mostrarAlerta('Error al cargar ciudades: ' + error.message);
    }
}

// Funciones para Diagnósticos
async function cargarDiagnosticos() {
    try {
        const response = await fetch('/api/diagnosticos');
        if (!response.ok) throw new Error('Error al cargar diagnósticos');
        diagnosticos = await response.json();
        actualizarTablaDiagnosticos();
    } catch (error) {
        mostrarAlerta('Error al cargar diagnósticos: ' + error.message);
    }
}

function actualizarTablaDiagnosticos() {
    const tbody = document.getElementById('tabla-diagnosticos');
    tbody.innerHTML = '';
    diagnosticos.forEach(diagnostico => {
        const paciente = pacientes.find(p => p.Id_Paciente === diagnostico.Id_Paciente);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${diagnostico.Id_Diagnostico}</td>
            <td>${paciente ? paciente.Nombre : 'N/A'}</td>
            <td>${diagnostico.Condicion}</td>
            <td>${new Date(diagnostico.Fecha).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-primary btn-action" onclick="editarDiagnostico(${diagnostico.Id_Diagnostico})">Editar</button>
                <button class="btn btn-sm btn-danger btn-action" onclick="confirmarEliminacion(${diagnostico.Id_Diagnostico}, 'diagnostico')">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function mostrarFormularioDiagnostico() {
    document.getElementById('diagnostico-id').value = '';
    document.getElementById('diagnostico-form').reset();
    cargarPacientesSelect('paciente');
    document.getElementById('formulario-diagnostico').style.display = 'block';
}

function ocultarFormularioDiagnostico() {
    document.getElementById('formulario-diagnostico').style.display = 'none';
}

async function editarDiagnostico(id) {
    try {
        const diagnostico = diagnosticos.find(d => d.Id_Diagnostico === id);
        if (!diagnostico) throw new Error('Diagnóstico no encontrado');
        
        document.getElementById('diagnostico-id').value = diagnostico.Id_Diagnostico;
        document.getElementById('paciente').value = diagnostico.Id_Paciente;
        document.getElementById('condicion').value = diagnostico.Condicion;
        
        document.getElementById('formulario-diagnostico').style.display = 'block';
    } catch (error) {
        mostrarAlerta('Error al cargar datos del diagnóstico: ' + error.message);
    }
}

// ===================== EXÁMENES =====================
async function cargarExamenes() {
    try {
        const response = await fetch('/api/examenes');
        if (!response.ok) throw new Error('Error al cargar exámenes');
        examenes = await response.json();
        actualizarTablaExamenes();
    } catch (error) {
        mostrarAlerta('Error al cargar exámenes: ' + error.message);
    }
}

function actualizarTablaExamenes() {
    const tbody = document.getElementById('tabla-examenes');
    tbody.innerHTML = '';
    examenes.forEach(examen => {
        const paciente = pacientes.find(p => p.Id_Paciente === examen.Id_Paciente);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${examen.Id_Examen}</td>
            <td>${examen.Examen}</td>
            <td>${new Date(examen.Fecha_Realizacion).toLocaleDateString()}</td>
            <td>${paciente ? paciente.Nombre : 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-primary btn-action" onclick="editarExamen(${examen.Id_Examen})">Editar</button>
                <button class="btn btn-sm btn-danger btn-action" onclick="confirmarEliminacion(${examen.Id_Examen}, 'examenes')">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function mostrarFormularioExamen() {
    document.getElementById('examen-id').value = '';
    document.getElementById('examen-form').reset();
    cargarPacientesSelect('examen-paciente');
    document.getElementById('formulario-examen').style.display = 'block';
}

function ocultarFormularioExamen() {
    document.getElementById('formulario-examen').style.display = 'none';
}

async function editarExamen(id) {
    try {
        const examen = examenes.find(e => e.Id_Examen === id);
        if (!examen) throw new Error('Examen no encontrado');
        document.getElementById('examen-id').value = examen.Id_Examen;
        document.getElementById('examen-nombre').value = examen.Examen;
        document.getElementById('examen-fecha').value = examen.Fecha_Realizacion;
        await cargarPacientesSelect('examen-paciente');
        document.getElementById('examen-paciente').value = examen.Id_Paciente;
        document.getElementById('formulario-examen').style.display = 'block';
    } catch (error) {
        mostrarAlerta('Error al cargar datos del examen: ' + error.message);
    }
}

document.getElementById('examen-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('examen-id').value;
    const data = {
        Examen: document.getElementById('examen-nombre').value,
        Fecha_Realizacion: document.getElementById('examen-fecha').value,
        Id_Paciente: parseInt(document.getElementById('examen-paciente').value)
    };
    try {
        const url = id ? `/api/examenes/${id}` : '/api/examenes';
        const method = id ? 'PUT' : 'POST';
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al guardar el examen');
        }
        await cargarExamenes();
        ocultarFormularioExamen();
        mostrarAlerta('Examen guardado exitosamente', 'success');
    } catch (error) {
        mostrarAlerta(error.message);
    }
});

// ===================== MEDICAMENTOS =====================
let medicamentos = [];

async function cargarMedicamentos() {
    try {
        const response = await fetch('/api/medicamentos');
        if (!response.ok) throw new Error('Error al cargar medicamentos');
        medicamentos = await response.json();
        actualizarTablaMedicamentos();
    } catch (error) {
        mostrarAlerta('Error al cargar medicamentos: ' + error.message);
    }
}

function actualizarTablaMedicamentos() {
    const tbody = document.getElementById('tabla-medicamentos');
    tbody.innerHTML = '';
    medicamentos.forEach(med => {
        const paciente = pacientes.find(p => p.Id_Paciente === med.Id_Paciente);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${med.Id_Medicamento}</td>
            <td>${paciente ? paciente.Nombre : 'N/A'}</td>
            <td>${med.Desc_Medicamento}</td>
            <td>${med.Dosis}</td>
            <td>${med.Instrucciones}</td>
            <td>
                <button class="btn btn-sm btn-primary btn-action" onclick="editarMedicamento(${med.Id_Medicamento})">Editar</button>
                <button class="btn btn-sm btn-danger btn-action" onclick="confirmarEliminacion(${med.Id_Medicamento}, 'medicamentos')">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function mostrarFormularioMedicamento() {
    document.getElementById('medicamento-id').value = '';
    document.getElementById('medicamento-form').reset();
    cargarPacientesSelect('medicamento-paciente');
    document.getElementById('formulario-medicamento').style.display = 'block';
}

function ocultarFormularioMedicamento() {
    document.getElementById('formulario-medicamento').style.display = 'none';
}

async function editarMedicamento(id) {
    try {
        const med = medicamentos.find(m => m.Id_Medicamento === id);
        if (!med) throw new Error('Medicamento no encontrado');
        document.getElementById('medicamento-id').value = med.Id_Medicamento;
        await cargarPacientesSelect('medicamento-paciente');
        document.getElementById('medicamento-paciente').value = med.Id_Paciente;
        document.getElementById('medicamento-desc').value = med.Desc_Medicamento;
        document.getElementById('medicamento-dosis').value = med.Dosis;
        document.getElementById('medicamento-instrucciones').value = med.Instrucciones;
        document.getElementById('formulario-medicamento').style.display = 'block';
    } catch (error) {
        mostrarAlerta('Error al cargar datos del medicamento: ' + error.message);
    }
}

document.getElementById('medicamento-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('medicamento-id').value;
    const data = {
        Id_Paciente: parseInt(document.getElementById('medicamento-paciente').value),
        Desc_Medicamento: document.getElementById('medicamento-desc').value,
        Dosis: document.getElementById('medicamento-dosis').value,
        Instrucciones: document.getElementById('medicamento-instrucciones').value
    };
    try {
        const url = id ? `/api/medicamentos/${id}` : '/api/medicamentos';
        const method = id ? 'PUT' : 'POST';
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al guardar el medicamento');
        }
        await cargarMedicamentos();
        ocultarFormularioMedicamento();
        mostrarAlerta('Medicamento guardado exitosamente', 'success');
    } catch (error) {
        mostrarAlerta(error.message);
    }
});

// ===================== PLAN DE TRATAMIENTO =====================
let planes = [];

async function cargarPlanes() {
    try {
        const response = await fetch('/api/plantratamiento');
        if (!response.ok) throw new Error('Error al cargar planes de tratamiento');
        planes = await response.json();
        actualizarTablaPlanes();
    } catch (error) {
        mostrarAlerta('Error al cargar planes de tratamiento: ' + error.message);
    }
}

function actualizarTablaPlanes() {
    const tbody = document.getElementById('tabla-plantratamiento');
    tbody.innerHTML = '';
    planes.forEach(plan => {
        const paciente = pacientes.find(p => p.Id_Paciente === plan.Id_Paciente);
        const diagnostico = diagnosticos.find(d => d.Id_Diagnostico === plan.Id_Diagnostico);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${plan.Id_Plan}</td>
            <td>${paciente ? paciente.Nombre : 'N/A'}</td>
            <td>${diagnostico ? diagnostico.Condicion : 'N/A'}</td>
            <td>${plan.Tratamiento}</td>
            <td>${new Date(plan.Fecha).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-primary btn-action" onclick="editarPlan(${plan.Id_Plan})">Editar</button>
                <button class="btn btn-sm btn-danger btn-action" onclick="confirmarEliminacion(${plan.Id_Plan}, 'plantratamiento')">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function mostrarFormularioPlan() {
    document.getElementById('plan-id').value = '';
    document.getElementById('plan-form').reset();
    cargarPacientesSelect('plan-paciente');
    cargarDiagnosticosSelect('plan-diagnostico');
    document.getElementById('formulario-plan').style.display = 'block';
}

function ocultarFormularioPlan() {
    document.getElementById('formulario-plan').style.display = 'none';
}

async function editarPlan(id) {
    try {
        const plan = planes.find(p => p.Id_Plan === id);
        if (!plan) throw new Error('Plan no encontrado');
        document.getElementById('plan-id').value = plan.Id_Plan;
        await cargarPacientesSelect('plan-paciente');
        document.getElementById('plan-paciente').value = plan.Id_Paciente;
        await cargarDiagnosticosSelect('plan-diagnostico');
        document.getElementById('plan-diagnostico').value = plan.Id_Diagnostico;
        document.getElementById('plan-tratamiento').value = plan.Tratamiento;
        document.getElementById('plan-fecha').value = plan.Fecha;
        document.getElementById('formulario-plan').style.display = 'block';
    } catch (error) {
        mostrarAlerta('Error al cargar datos del plan: ' + error.message);
    }
}

document.getElementById('plan-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('plan-id').value;
    const data = {
        Id_Paciente: parseInt(document.getElementById('plan-paciente').value),
        Id_Diagnostico: parseInt(document.getElementById('plan-diagnostico').value),
        Tratamiento: document.getElementById('plan-tratamiento').value,
        Fecha: document.getElementById('plan-fecha').value
    };
    try {
        const url = id ? `/api/plantratamiento/${id}` : '/api/plantratamiento';
        const method = id ? 'PUT' : 'POST';
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al guardar el plan');
        }
        await cargarPlanes();
        ocultarFormularioPlan();
        mostrarAlerta('Plan guardado exitosamente', 'success');
    } catch (error) {
        mostrarAlerta(error.message);
    }
});

// ===================== RESULTADO LAB =====================
let resultados = [];

async function cargarResultados() {
    try {
        const response = await fetch('/api/resultado_lab');
        if (!response.ok) throw new Error('Error al cargar resultados de laboratorio');
        resultados = await response.json();
        actualizarTablaResultados();
    } catch (error) {
        mostrarAlerta('Error al cargar resultados de laboratorio: ' + error.message);
    }
}

function actualizarTablaResultados() {
    const tbody = document.getElementById('tabla-resultado_lab');
    tbody.innerHTML = '';
    resultados.forEach(res => {
        const medicamento = medicamentos.find(m => m.Id_Medicamento === res.Id_Medicamento);
        const examen = examenes.find(e => e.Id_Examen === res.Id_Examen);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${res.Id_Resultado}</td>
            <td>${medicamento ? medicamento.Desc_Medicamento : 'N/A'}</td>
            <td>${examen ? examen.Examen : 'N/A'}</td>
            <td>${res.Valor}</td>
            <td>${new Date(res.Fecha).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-primary btn-action" onclick="editarResultado(${res.Id_Resultado})">Editar</button>
                <button class="btn btn-sm btn-danger btn-action" onclick="confirmarEliminacion(${res.Id_Resultado}, 'resultado_lab')">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function mostrarFormularioResultado() {
    document.getElementById('resultado-id').value = '';
    document.getElementById('resultado-form').reset();
    cargarMedicamentosSelect('resultado-medicamento');
    cargarExamenesSelect('resultado-examen');
    cargarPacientesSelect('paciente-id');
    document.getElementById('formulario-resultado').style.display = 'block';
}

function ocultarFormularioResultado() {
    document.getElementById('formulario-resultado').style.display = 'none';
}

async function editarResultado(id) {
    try {
        const resul = resultados.find(r => r.Id_Resultado === id);
        if (!resul) throw new Error('Resultado no encontrado');
        document.getElementById('resultado-id').value = resul.Id_Resultado;
        await cargarMedicamentosSelect('resultado-medicamento');
        document.getElementById('resultado-medicamento').value = resul.Id_Medicamento;
        await cargarExamenesSelect('resultado-examen');
        document.getElementById('resultado-examen').value = resul.Id_Examen;
        document.getElementById('resultado-valor').value = resul.Valor;
        document.getElementById('resultado-fecha').value = resul.Fecha;
        document.getElementById('formulario-resultado').style.display = 'block';
    } catch (error) {
        mostrarAlerta('Error al cargar datos del resultado: ' + error.message);
    }
}

document.getElementById('resultado-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('resultado-id').value;
    const data = {
        Id_Medicamento: parseInt(document.getElementById('resultado-medicamento').value),
        Id_Examen: parseInt(document.getElementById('resultado-examen').value),
        Valor: parseInt(document.getElementById('resultado-valor').value),
        Fecha: document.getElementById('resultado-fecha').value
    };
    try {
        const url = id ? `/api/resultado_lab/${id}` : '/api/resultado_lab';
        const method = id ? 'PUT' : 'POST';
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al guardar el resultado');
        }
        await cargarResultados();
        ocultarFormularioResultado();
        mostrarAlerta('Resultado guardado exitosamente', 'success');
    } catch (error) {
        mostrarAlerta(error.message);
    }
});

// ===================== SELECTS AUXILIARES =====================
async function cargarPacientesSelect(idSelect) {
    await cargarPacientes();
    const select = document.getElementById(idSelect);
    select.innerHTML = '<option value="">Seleccione un paciente</option>';
    pacientes.forEach(p => {
        const option = document.createElement('option');
        option.value = p.Id_Paciente;
        option.textContent = p.Nombre;
        select.appendChild(option);
    });
}

async function cargarDiagnosticosSelect(idSelect) {
    await cargarDiagnosticos();
    const select = document.getElementById(idSelect);
    select.innerHTML = '<option value="">Seleccione un diagnóstico</option>';
    diagnosticos.forEach(d => {
        const option = document.createElement('option');
        option.value = d.Id_Diagnostico;
        option.textContent = d.Condicion;
        select.appendChild(option);
    });
}

async function cargarMedicamentosSelect(idSelect) {
    await cargarMedicamentos();
    const select = document.getElementById(idSelect);
    select.innerHTML = '<option value=""> Seleccione un medicamento </option>';
    medicamentos.forEach(m => {
        const option = document.createElement('option');
        option.value = m.Id_Medicamento;
        option.textContent = m.Desc_Medicamento;
        select.appendChild(option);
    });
}

async function cargarExamenesSelect(idSelect) {
    await cargarExamenes();
    const select = document.getElementById(idSelect);
    select.innerHTML = '<option value="">Seleccione un examen</option>';
    examenes.forEach(e => {
        const option = document.createElement('option');
        option.value = e.Id_Examen;
        option.textContent = e.Examen;
        select.appendChild(option);
    });
}

// ===================== NAVEGACIÓN ENTRE SECCIONES =====================
function mostrarSeccion(seccion) {
    document.querySelectorAll('.seccion').forEach(s => s.style.display = 'none');
    document.getElementById(`seccion-${seccion}`).style.display = 'block';
    switch (seccion) {
        case 'pacientes': cargarPacientes(); break;
        case 'diagnosticos': cargarDiagnosticos(); break;
        case 'examenes': cargarExamenes(); break;
        case 'medicamentos': cargarMedicamentos(); break;
        case 'plantratamiento': cargarPlanes(); break;
        case 'resultado_lab': cargarResultados(); break;
    }
}

// ===================== ELIMINACIÓN GENÉRICA =====================
function confirmarEliminacion(id, tipo) {
    currentId = id;
    currentType = tipo;
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    modal.show();
}

async function eliminarRegistro() {
    try {
        const url = `/api/${currentType}/${currentId}`;
        const response = await fetch(url, { method: 'DELETE' });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al eliminar el registro');
        }
        switch (currentType) {
            case 'pacientes': await cargarPacientes(); break;
            case 'diagnosticos': await cargarDiagnosticos(); break;
            case 'examenes': await cargarExamenes(); break;
            case 'medicamentos': await cargarMedicamentos(); break;
            case 'plantratamiento': await cargarPlanes(); break;
            case 'resultado_lab': await cargarResultados(); break;
        }
        mostrarAlerta('Registro eliminado exitosamente', 'success');
    } catch (error) {
        mostrarAlerta(error.message);
    }
}

document.getElementById('confirmDelete').addEventListener('click', async () => {
    await eliminarRegistro();
    bootstrap.Modal.getInstance(document.getElementById('confirmModal')).hide();
});

// ===================== INICIALIZACIÓN =====================
document.addEventListener('DOMContentLoaded', () => {
    cargarPacientes();
}); 