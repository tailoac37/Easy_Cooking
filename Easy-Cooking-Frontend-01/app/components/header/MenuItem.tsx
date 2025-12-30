import Link from "next/link"
import { usePathname } from "next/navigation";


export const MenuItem = (props: any) => {
    const {item} = props;

    const pathname = usePathname();

    return (
        <>
            <li className="">
                <Link
                    href={item.link}
                    className={"flex items-center hover:text-[#00ADEF] " + (pathname === item.link ? "drop-shadow-[0_0_4px_rgba(0,173,239,0.8)]" : "text-black")}
                >
                    <span className="text-[16px] font-[700]">
                        {item.title}
                    </span>
                </Link>
            </li>
        </>
    )
}
