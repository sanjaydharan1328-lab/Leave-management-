const form = document.getElementById("leaveForm");
const leaveTable = document.getElementById("leaveTable");

let leaves = JSON.parse(localStorage.getItem("leaves")) || [];

function saveLeaves() {
    localStorage.setItem("leaves", JSON.stringify(leaves));
}

function calculateDays(from, to) {
    const start = new Date(from + "T00:00:00");
    const end = new Date(to + "T00:00:00");

    return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

// Submit leave application
form.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("employeeName").value.trim();
    const id = document.getElementById("employeeId").value.trim();
    const type = document.getElementById("leaveType").value;
    const from = document.getElementById("fromDate").value;
    const to = document.getElementById("toDate").value;
    const reason = document.getElementById("reason").value.trim();

    if (new Date(to) < new Date(from)) {
        alert("End date cannot be earlier than start date!");
        return;
    }

    const leave = {
        id: Date.now(),
        name,
        employeeId: id,
        type,
        from,
        to,
        days: calculateDays(from, to),
        reason,
        status: "Pending"
    };

    leaves.push(leave);

    saveLeaves();
    displayLeaves();

    form.reset();

    alert("Leave application submitted successfully!");
});

// Display leave applications
function displayLeaves(search = "") {
    leaveTable.innerHTML = "";

    const filteredLeaves = leaves.filter(leave =>
        leave.name.toLowerCase().includes(search.toLowerCase()) ||
        leave.employeeId.toLowerCase().includes(search.toLowerCase())
    );

    filteredLeaves.forEach(leave => {
        const row = document.createElement("tr");

        const values = [
            leave.name,
            leave.employeeId,
            leave.type,
            leave.from,
            leave.to,
            leave.days,
            leave.reason
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const statusCell = document.createElement("td");
        const status = document.createElement("span");
        status.className = "status " + leave.status;
        status.textContent = leave.status;
        statusCell.appendChild(status);
        row.appendChild(statusCell);

        const actionCell = document.createElement("td");

        if (leave.status === "Pending") {
            const approveBtn = document.createElement("button");
            approveBtn.textContent = "Approve";
            approveBtn.className = "approve";
            approveBtn.onclick = () => updateStatus(leave.id, "Approved");

            const rejectBtn = document.createElement("button");
            rejectBtn.textContent = "Reject";
            rejectBtn.className = "reject";
            rejectBtn.onclick = () => updateStatus(leave.id, "Rejected");

            actionCell.append(approveBtn, rejectBtn);
        }

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete";
        deleteBtn.onclick = () => deleteLeave(leave.id);

        actionCell.appendChild(deleteBtn);
        row.appendChild(actionCell);

        leaveTable.appendChild(row);
    });

    updateDashboard();
}

// Update application status
function updateStatus(id, newStatus) {
    leaves = leaves.map(leave =>
        leave.id === id
            ? { ...leave, status: newStatus }
            : leave
    );

    saveLeaves();
    displayLeaves(document.getElementById("searchInput").value);
}

// Delete application
function deleteLeave(id) {
    if (confirm("Are you sure you want to delete this application?")) {
        leaves = leaves.filter(leave => leave.id !== id);

        saveLeaves();
        displayLeaves(document.getElementById("searchInput").value);
    }
}

// Dashboard counters
function updateDashboard() {
    document.getElementById("totalCount").textContent = leaves.length;

    document.getElementById("pendingCount").textContent =
        leaves.filter(l => l.status === "Pending").length;

    document.getElementById("approvedCount").textContent =
        leaves.filter(l => l.status === "Approved").length;

    document.getElementById("rejectedCount").textContent =
        leaves.filter(l => l.status === "Rejected").length;
}

// Search employee
document.getElementById("searchInput").addEventListener("input", function() {
    displayLeaves(this.value);
});

// Initial display
displayLeaves();
