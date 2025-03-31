import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Modal,
    Button,
} from "react-native";
import { getCurrentUser, databases } from "../../lib/appwriteConfig"; // Ensure you have this imported
import TopBar from "../MenuBars/TopBar";
import { useTheme } from "../ThemeContext";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const Screen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [activeTab, setActiveTab] = useState("My Tasks");
    const [tasks, setTasks] = useState([]); // State to store tasks
    const { theme } = useTheme();
    const [isModalVisible, setModalVisible] = useState(false); // State to manage modal visibility
    const [taskToEdit, setTaskToEdit] = useState(null); // Store task to edit

    useEffect(() => {
        const fetchUser = async () => {
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                navigation.replace("Auth");
            } else {
                setUser(currentUser);
                fetchTasks(); // Fetch tasks when the user is fetched
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await databases.listDocuments(
                "67de6cb1003c63a59683", // Your database ID
                "67e15b720007d994f573" // Your collection ID
            );
            setTasks(response.documents); // Set the tasks data to the state
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case "High":
                return { backgroundColor: "#FFE0E0", color: "#FF4D4F" };
            case "Medium":
                return { backgroundColor: "#FFF7D6", color: "#FFA500" };
            case "Low":
                return { backgroundColor: "#DFFFE0", color: "#52C41A" };
            default:
                return { backgroundColor: "#eee", color: "#333" };
        }
    };

    const filteredTasks = tasks.filter((task) =>
        task.title.toLowerCase().includes(searchText.toLowerCase()) &&
        (activeTab === "View All" || task.status === activeTab)
    );

    const deleteTask = async (taskId) => {
        try {
            await databases.deleteDocument(
                "67de6cb1003c63a59683", // Your database ID
                "67e15b720007d994f573", // Your collection ID
                taskId // Task ID to delete
            );
            setTasks((prevTasks) => prevTasks.filter((task) => task.$id !== taskId));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const openEditModal = (task) => {
        setTaskToEdit(task); // Set the task to be edited
        setModalVisible(true); // Show modal
    };

    const closeEditModal = () => {
        setModalVisible(false); // Close modal
        setTaskToEdit(null); // Reset task to edit
    };

    const updateTask = async () => {
        if (!taskToEdit) return;
        try {
            // Update task in the database
            await databases.updateDocument(
                "67de6cb1003c63a59683", // Your database ID
                "67e15b720007d994f573", // Your collection ID
                taskToEdit.$id, // Task ID to update
                {
                    title: taskToEdit.title,
                    description: taskToEdit.description,
                    priority: taskToEdit.priority,
                    status: taskToEdit.status,
                    Deadline: taskToEdit.Deadline,
                }
            );
            fetchTasks(); // Refresh tasks
            closeEditModal(); // Close the modal
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme === "dark" ? "#121212" : "#F5F5F5" }]}>
                <ActivityIndicator size="large" color={theme === "dark" ? "#FFD700" : "#007AFF"} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: "#F8FAFF" }]}>
            <TopBar title="Home" />

            {/* Summary Cards */}
            <View style={styles.summaryRow}>
                <View style={[styles.summaryCard, { backgroundColor: "#E5EDFF" }]}>
                    <Text style={styles.summaryTitle}>Total</Text>
                    <Text style={styles.summaryValue}>{tasks.length}</Text>
                </View>
                <View style={[styles.summaryCard, { backgroundColor: "#DFFFE0" }]}>
                    <Text style={styles.summaryTitle}>Completed</Text>
                    <Text style={styles.summaryValue}>
                        {tasks.filter((task) => task.status === "Completed").length}
                    </Text>
                </View>
                <View style={[styles.summaryCard, { backgroundColor: "#FFE0E0" }]}>
                    <Text style={styles.summaryTitle}>Overdue</Text>
                    <Text style={styles.summaryValue}>3</Text>
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
                <TextInput
                    placeholder="Search Task"
                    placeholderTextColor="#999"
                    style={styles.searchInput}
                    value={searchText}
                    onChangeText={(text) => setSearchText(text)}
                />
                <Ionicons name="search" size={20} color="#999" />
            </View>

            {/* Filter Tabs */}
            <View style={styles.tabs}>
                {["My Tasks", "In-progress", "Completed"].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={activeTab === tab ? styles.activeTab : styles.inactiveTab}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={styles.tabText}>{tab}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => setActiveTab("View All")}>
                    <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
            </View>

            {/* Task List */}
            <ScrollView contentContainerStyle={styles.taskList}>
                {filteredTasks.length === 0 ? (
                    <Text style={{ color: "#888", textAlign: "center", marginTop: 30 }}>No tasks found</Text>
                ) : (
                    filteredTasks.map((task, index) => {
                        const priorityStyle = getPriorityStyle(task.priority);
                        return (
                            <View key={index} style={styles.taskCard}>
                                <View style={styles.taskHeader}>
                                    <Text style={styles.taskTitle}>○ {task.title}</Text>
                                    <Text style={[styles.priorityBadge, {
                                        backgroundColor: priorityStyle.backgroundColor,
                                        color: priorityStyle.color,
                                    }]}>
                                        {task.priority}
                                    </Text>
                                </View>
                                <Text style={styles.taskDescription}>{task.description}</Text>
                                <View style={styles.taskFooter}>
                                    <View style={styles.taskDate}>
                                        <Ionicons name="calendar-outline" size={16} color="#666" />
                                        <Text style={styles.dateText}>{task.Deadline}</Text>
                                    </View>
                                    <View style={styles.taskActions}>
                                        <TouchableOpacity
                                            style={styles.iconButton}
                                            onPress={() => openEditModal(task)} // Open modal to edit task
                                        >
                                            <MaterialIcons name="edit" size={20} color="#333" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.iconButton}
                                            onPress={() => deleteTask(task.$id)}  // Call delete function when button is pressed
                                        >
                                            <MaterialIcons name="delete" size={20} color="#333" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* Modal for updating task */}
            <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Update Task</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Title"
                            value={taskToEdit?.title}
                            onChangeText={(text) => setTaskToEdit({ ...taskToEdit, title: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Description"
                            value={taskToEdit?.description}
                            onChangeText={(text) => setTaskToEdit({ ...taskToEdit, description: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Priority"
                            value={taskToEdit?.priority}
                            onChangeText={(text) => setTaskToEdit({ ...taskToEdit, priority: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Deadline"
                            value={taskToEdit?.Deadline}
                            onChangeText={(text) => setTaskToEdit({ ...taskToEdit, Deadline: text })}
                        />

                        <View style={styles.modalActions}>
                            <Button title="Update" onPress={updateTask} />
                            <Button title="Cancel" onPress={closeEditModal} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    summaryRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
    summaryCard: { borderRadius: 12, padding: 12, width: "30%", alignItems: "center" },
    summaryTitle: { fontSize: 14, color: "#444" },
    summaryValue: { fontSize: 20, fontWeight: "bold" },
    searchBar: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        margin: 15,
        alignItems: "center",
        elevation: 1,
    },
    searchInput: { flex: 1, fontSize: 14 },
    tabs: {
        flexDirection: "row",
        paddingHorizontal: 15,
        alignItems: "center",
        marginBottom: 10,
        flexWrap: "wrap",
    },
    activeTab: {
        backgroundColor: "#fff",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        marginRight: 10,
        elevation: 2,
    },
    inactiveTab: {
        backgroundColor: "#E9ECF2",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        marginRight: 10,
    },
    tabText: { fontSize: 14, color: "#333" },
    viewAllText: { fontSize: 13, color: "#007AFF", marginLeft: 10 },
    taskList: { paddingHorizontal: 15, paddingBottom: 100 },
    taskCard: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 15,
        marginBottom: 12,
        elevation: 1,
    },
    taskHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
    taskTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
    priorityBadge: {
        fontSize: 12,
        paddingVertical: 2,
        paddingHorizontal: 10,
        borderRadius: 12,
        overflow: "hidden",
        fontWeight: "bold",
    },
    taskDescription: { fontSize: 14, color: "#555", marginBottom: 10 },
    taskFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    taskDate: { flexDirection: "row", alignItems: "center", gap: 5 },
    dateText: { fontSize: 13, marginLeft: 5, color: "#666" },
    taskActions: { flexDirection: "row", gap: 15 },
    iconButton: { padding: 4 },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        width: "80%",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingLeft: 10,
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
});

export default Screen;
