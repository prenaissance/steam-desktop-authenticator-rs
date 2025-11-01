use std::io;
use std::path::{Path, PathBuf};

use protobuf_codegen::Codegen;

fn main() {
    let mut codegen = Codegen::new();
    codegen
        .pure()
        .include("protobufs")
        .cargo_out_dir("protobufs");

    let proto_files = get_all_proto_paths("protobufs").expect("failed to read protobufs directory");
    for proto_file in proto_files {
        codegen.input(proto_file);
    }

    codegen.run_from_script();
    tauri_build::build();
}

fn get_all_proto_paths<P: AsRef<Path>>(dir: P) -> Result<Vec<PathBuf>, io::Error> {
    let mut paths = Vec::new();
    let proto_files = std::fs::read_dir(dir).expect("failed to read protobufs directory");
    for proto_file in proto_files {
        let proto_file = proto_file?;
        if proto_file.file_type().unwrap().is_dir() {
            let sub_paths = get_all_proto_paths(proto_file.path())?;
            paths.extend(sub_paths);
        } else {
            paths.push(proto_file.path());
        }
    }
    Ok(paths)
}
