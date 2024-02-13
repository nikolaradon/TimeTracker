const apikey = '79862385-19f1-40cd-8d88-d64806037b93';
const apihost = 'https://todo-api.coderslab.pl';



document.addEventListener('DOMContentLoaded', function() {

    function renderTask(taskId, title, description, status) {
        const section = document.createElement('section');
        section.className = 'card mt-5 shadow-sm';
        document.querySelector('main').appendChild(section);

        const headerDiv = document.createElement('div');
        headerDiv.className = 'card-header d-flex justify-content-between align-items-center';
        section.appendChild(headerDiv);

        const headerLeftDiv = document.createElement('div');
        headerDiv.appendChild(headerLeftDiv);

        const h5 = document.createElement('h5');
        h5.innerText = title;
        headerLeftDiv.appendChild(h5);

        const h6 = document.createElement('h6');
        h6.className = 'card-subtitle text-muted';
        h6.innerText = description;
        headerLeftDiv.appendChild(h6);

        const headerRightDiv = document.createElement('div');
        headerDiv.appendChild(headerRightDiv);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-outline-danger btn-sm ml-2';
        deleteButton.innerText = 'Delete';
        headerRightDiv.appendChild(deleteButton);

        deleteButton.addEventListener('click', function (){
            apiDeleteTask(taskId).then(
                function () {
                    section.parentElement.removeChild(section)
                }
            )
        })

        if (status == 'open') {
            const finishButton = document.createElement('button');
            finishButton.className = 'btn btn-dark btn-sm';
            finishButton.innerText = 'Finish';
            headerRightDiv.appendChild(finishButton);

            finishButton.addEventListener('click', function() {
                apiUpdateTask(taskId, title, description, 'closed');
                section.querySelectorAll('.js-task-open-only').forEach(
                    function(element) { element.parentElement.removeChild(element); }
                );
            });
        }

        const ul = document.createElement('ul');
        ul.className = 'list-group list-group-flush';
        section.appendChild(ul);

        apiListOperationsForTask(taskId).then(
            function(response){
                response.data.forEach(
                    function(operation) {
                        renderOperation(ul, status, operation.id, operation.description, operation.timeSpent);

                    }
                )
            }
        )


        if(status == 'open') {
            const addOperationDiv = document.createElement('div');
            addOperationDiv.className = 'card-body js-task-open-only';
            section.appendChild(addOperationDiv);

            const form = document.createElement('form');
            addOperationDiv.appendChild(form);

            const inputGroup = document.createElement('div');
            inputGroup.className = 'input-group';
            form.appendChild(inputGroup);

            form.addEventListener('submit', function (e) {
                e.preventDefault();
                apiCreateOperationForTask(taskId, descriptionInput.value).then(
                    function (response) {
                        renderOperation(
                            ul,
                            status,
                            response.data.id,
                            response.data.description,
                            response.data.timeSpent
                        );
                    }
                );
            })

            const descriptionInput = document.createElement('input');
            descriptionInput.setAttribute('type', 'text');
            descriptionInput.setAttribute('placeholder', 'Operation description');
            descriptionInput.setAttribute('minlength', '5');
            descriptionInput.className = 'form-control';
            inputGroup.appendChild(descriptionInput);

            const inputGroupAppend = document.createElement('div');
            inputGroupAppend.className = 'input-group-append';
            inputGroup.appendChild(inputGroupAppend);

            const addButton = document.createElement('button');
            addButton.className = 'btn btn-info';
            addButton.innerText = 'Add';
            inputGroupAppend.appendChild(addButton);

        }
    }

    function apiListTasks() {
        return fetch(
            apihost + '/api/tasks',
            {
                headers: { Authorization: apikey }
            }
        ).then(
            function(response) {
                if(!response.ok) {
                    alert('An error has occurred! Open devtools and go to the Network tab, and look for the cause.');
                }
                return response.json();
            }
        )
    }


    apiListTasks().then(
        function(response) {
            response.data.forEach(
                function(task) { renderTask(task.id, task.title, task.description, task.status); }
            );
        }
    );


    function apiCreateTask(title, description) {
        return fetch(
            apihost + '/api/tasks',
            {
                headers: { Authorization: apikey, 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: title, description: description, status: 'open' }),
                method: 'POST'
            }
        ).then(
            function(response) {
                if(!response.ok) {
                    alert('An error has occurred! Open devtools and go to the Network tab, and look for the cause.');
                }
                return response.json();
            }
        )
    }

    const form = document.querySelector('.js-task-adding-form');
    form.addEventListener('submit', function (e){
        e.preventDefault();
        apiCreateTask(e.target.elements.title.value, e.target.elements.description.value).then(
            function (response){
                renderTask(response.data.id, response.data.title, response.data.description, response.data.status);
            }
        )
    })

    function apiListOperationsForTask(taskId) {
        return fetch(
            apihost + '/api/tasks/' + taskId + '/operations',
            {
                headers: { 'Authorization': apikey }
            }
        ).then(function (resp) {
            // ...
            if (!resp.ok) {
                alert('An error has occurred! Open devtools and go to the Network tab, and look for the cause.');
            }
            return resp.json();
        });
    }

    function renderOperation(ul, status, operationId, operationDescription, timeSpent) {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        ul.appendChild(li);

        const descriptionDiv = document.createElement('div');
        descriptionDiv.innerText = operationDescription;
        li.appendChild(descriptionDiv);

        const time = document.createElement('span');
        time.className = 'badge badge-success badge-pill ml-2';
        time.innerText = formatTime(timeSpent);
        descriptionDiv.appendChild(time);

        if(status == "open") {
            const controlDiv = document.createElement('div');
            controlDiv.className = 'js-task-open-only';
            li.appendChild(controlDiv);

            const add15minButton = document.createElement('button');
            add15minButton.className = 'btn btn-outline-success btn-sm mr-2';
            add15minButton.innerText = '+15m';
            controlDiv.appendChild(add15minButton);

            add15minButton.addEventListener('click', function () {
                apiUpdateOperation(operationId, operationDescription, timeSpent + 15).then(
                    function(response) {
                        time.innerText = formatTime(response.data.timeSpent);
                        timeSpent = response.data.timeSpent; // to add 15 min more after clicking the button
                    }
                )
            })

            const add1hButton = document.createElement('button');
            add1hButton.className = 'btn btn-outline-success btn-sm mr-2';
            add1hButton.innerText = '+1h';
            controlDiv.appendChild(add1hButton);

            add1hButton.addEventListener('click', function () {
                apiUpdateOperation(operationId, operationDescription, timeSpent + 60).then(
                    function(response) {
                        time.innerText = formatTime(response.data.timeSpent);
                        timeSpent = response.data.timeSpent;
                    }
                )
            })

            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-outline-danger btn-sm';
            deleteButton.innerText = 'Delete';
            controlDiv.appendChild(deleteButton);

            deleteButton.addEventListener('click', function () {
                apiDeleteOperation(operationId).then(
                    function () {
                        li.parentElement.removeChild(li);
                    }
                )
            })
        }
    }

    function formatTime(timeSpent) {
        const hours = Math.floor(timeSpent / 60);
        const minutes = timeSpent % 60;
        if(hours > 0) {
            return hours + 'h ' + minutes + 'm';
        } else {
            return minutes + 'm';
        }
    }

    function apiDeleteTask(taskId) {
        return fetch(
            apihost + '/api/tasks/' + taskId,
            {
                headers: { Authorization: apikey },
                method: 'DELETE'
            }
        ).then(
            function (response) {
                if(!response.ok) {
                    alert('An error has occurred! Open devtools and go to the Network tab, and look for the cause.');
                }
                return response.json();
            }
        )
    }

    function apiCreateOperationForTask(taskId, description) {
        return fetch(
            apihost + '/api/tasks/' + taskId + '/operations',
            {
                headers: { Authorization: apikey, 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: description, timeSpent: 0 }),
                method: 'POST'
            }
        ).then(
            function (response) {
                if(!response.ok) {
                    alert('An error has occurred! Open devtools and go to the Network tab, and look for the cause.');
                }
                return response.json();
            }
        );
    }

    function apiUpdateOperation(operationId, description, timeSpent) {
        return fetch(
            apihost + '/api/operations/' + operationId,
            {
                headers: { Authorization: apikey, 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: description, timeSpent: timeSpent }),
                method: 'PUT'
            }
        ).then(
            function (response) {
                if(!response.ok) {
                    alert('An error has occurred! Open devtools and go to the Network tab, and look for the cause.');
                }
                return response.json();
            }
        );
    }

    function apiDeleteOperation(operationId) {
        return fetch(
            apihost + '/api/operations/' + operationId,
            {
                headers: { Authorization: apikey },
                method: 'DELETE'
            }
        ).then(
            function (resp) {
                if(!resp.ok) {
                    alert('An error has occurred! Open devtools and go to the Network tab, and look for the cause.');
                }
                return resp.json();
            }
        )
    }

    function apiUpdateTask(taskId, title, description, status) {
        return fetch(
            apihost + '/api/tasks/' + taskId,
            {
                headers: { Authorization: apikey, 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: title, description: description, status: status }),
                method: 'PUT'
            }
        ).then(
            function (resp) {
                if(!resp.ok) {
                    alert('An error has occurred! Open devtools and go to the Network tab, and look for the cause.');
                }
                return resp.json();
            }
        );
    }


});

