// =========================================
// Base Email Layout Template
// =========================================
const baseTemplate = (innerContent) => {
    return `
    
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
            <!-- Header -->
<div style="text-align:center; margin-bottom:25px;">
    <h1 style="color:#2E7D32; margin:0;">
        🚜 AgriRentX
    </h1>

    <p style="color:#777; margin-top:5px;">
        Farm Equipment Rental Platform
    </p>
</div>
            <!-- Dynamic Content -->
            <div style="margin-bottom: 20px; line-height: 1.6;">
    ${innerContent}
</div>
            
            <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
            
            <!-- Standard Footer -->
            <div style="color: #666; font-size: 12px; line-height: 1.5;">
                
            <p style="margin:0; font-weight:bold; color:#2E7D32;">
    🚜 Team AgriRentX1
</p>

<p style="margin-top:6px;">
    Empowering Farmers Through Smart Equipment Rental
</p>

<p style="margin-top:10px;">
    © ${new Date().getFullYear()} AgriRentX. All Rights Reserved.
</p>
                <p style="margin: 5px 0 0 0;">This is an automated system email. Please do not reply directly to this message.</p>
            </div>
        </div>
    </div>
    `;
};

module.exports = baseTemplate;
