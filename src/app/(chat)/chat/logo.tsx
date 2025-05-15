import React from 'react';
import Image from "next/image";

const Logo = () => {
    return (
        <div className='logo-responsive'>
            <Image
                className="dark:invert"
                src="/logo.svg"
                alt="dw chat logo"
                width={38}
                height={38}
                priority
            />
            <style jsx global>{`
                .logo-responsive {
                    width: 48px;
                    margin-left: 6px;
                }
                @media (max-width: 600px) {
                    .logo-responsive {
                        width: 32px !important;
                        margin-left: 2px !important;
                    }
                    .logo-responsive img {
                        width: 28px !important;
                        height: 28px !important;
                    }
                }
                @media (max-width: 400px) {
                    .logo-responsive {
                        width: 24px !important;
                        margin-left: 0 !important;
                    }
                    .logo-responsive img {
                        width: 20px !important;
                        height: 20px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Logo;