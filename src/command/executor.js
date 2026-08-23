export async function executeCommand(command, context) {
    if (!command?.run) {
        return false;
    }

    try {
        await command.run(context);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}