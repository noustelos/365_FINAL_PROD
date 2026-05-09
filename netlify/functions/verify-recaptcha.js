exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ success: false, error: 'Method Not Allowed' })
        };
    }

    try {
        const { token, action } = JSON.parse(event.body || '{}');
        if (!token) {
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, error: 'Missing token' })
            };
        }

        const secret = process.env.RECAPTCHA_SECRET_KEY;
        if (!secret) {
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, error: 'Missing RECAPTCHA_SECRET_KEY' })
            };
        }

        const params = new URLSearchParams();
        params.append('secret', secret);
        params.append('response', token);

        const forwardedFor = event.headers['x-forwarded-for'] || event.headers['X-Forwarded-For'];
        const remoteIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '';
        if (remoteIp) {
            params.append('remoteip', remoteIp);
        }

        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        const data = await response.json();
        const expectedAction = action || 'subscribe';
        const score = Number(data.score || 0);
        const passed = Boolean(data.success) && data.action === expectedAction && score >= 0.5;

        return {
            statusCode: passed ? 200 : 400,
            body: JSON.stringify({
                success: passed,
                score,
                action: data.action || null,
                errors: data['error-codes'] || []
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: 'Verification failed' })
        };
    }
};
