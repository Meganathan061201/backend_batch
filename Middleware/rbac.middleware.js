
function authorize(allowedRoles = []) {
    
    if (typeof allowedRoles === 'string') {
        allowedRoles = [allowedRoles];
    }

    return (req, res, next) => {
       
        if (!req.user || !req.user.role) {
            return res.status(401).json({ 
                error: 'Unauthorized',
                message: 'Access denied. No role information found in token payload.' 
            });
        }

        
        const hasPermission = allowedRoles.includes(req.user.role);

        if (!hasPermission) {
            return res.status(403).json({ 
                error: 'Forbidden',
                message: `Access denied. Role '${req.user.role}' is not authorized to access this resource. Required roles: [${allowedRoles.join(', ')}]` 
            });
        }

        next();
    };
}

module.exports = {
    authorize
};






