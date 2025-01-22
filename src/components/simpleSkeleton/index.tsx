export default function SimpleSkeleton(
    { height } : { height?: string }
){
    return(
        <div className="bg-slate-200 animate-pulse h-64 w-full rounded-xl"
        ></div>
    )
}